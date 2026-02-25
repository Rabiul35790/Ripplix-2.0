<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Library;
use App\Models\LibraryView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\BoardShared;
use App\Models\Category;
use App\Models\Platform;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class CollectionController extends Controller
{
    /**
     * Display the collections page
     */

    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }

    private function getCurrentPlan($user)
    {
        if (!$user) {
            return null;
        }
        return $user->getCurrentPlan(); // Now cached in model
    }

    public function index(Request $request): Response
    {
        $boards = [];
        $userPlanLimits = null;
        $currentPlan = null;

        $filters = $this->getFilters();

        if (auth()->check()) {
            $user = auth()->user();
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);

            $allBoards = Board::forUser(auth()->id())
                ->orderBy('created_at', 'desc')
                ->withCount('libraries')
                ->with(['libraries.categories'])
                ->get();

            $boards = $allBoards->map(function ($board, $index) use ($userPlanLimits) {
                // Get first 4 libraries with their video_url for the stacked video display
                $libraries = $board->libraries
                    ->take(4) // Limit to 4 for display
                    ->map(function ($library) {
                        return [
                            'id' => $library->id,
                            'title' => $library->title,
                            'video_url' => $library->video_url,
                        ];
                    })
                    ->toArray();

                // Check if this board should be blurred (only for free plans)
                $isBlurred = $userPlanLimits['isFree'] && $index >= $userPlanLimits['maxBoards'];

                return [
                    'id' => $board->id,
                    'name' => $board->name,
                    'creator_email' => $board->creator_email,
                    'visibility' => $board->visibility,
                    'share_via_link' => $board->share_via_link,
                    'share_via_email' => $board->share_via_email,
                    'share_emails' => $board->share_emails,
                    'share_url' => $board->getShareUrl(),
                    'created_at' => $board->created_at->format('M j, Y'),
                    'libraries_count' => $board->libraries_count,
                    'libraries' => $libraries,
                    'is_blurred' => $isBlurred,
                ];
            });
        }
        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return Inertia::render('Collections', [
            'boards' => $boards,
            'filters' => $filters,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
        ]);
    }

    /**
     * Store a new board
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $userPlanLimits = $this->getUserPlanLimits($user);

        // Check if user can create more boards
        if ($userPlanLimits['isFree']) {
            $currentBoardCount = Board::where('user_id', $user->id)->count();
            if ($currentBoardCount >= $userPlanLimits['maxBoards']) {
                return back()->withErrors([
                    'plan_limit' => 'You have reached the maximum number of boards for your current plan. Upgrade to create more boards.'
                ]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'creator_email' => 'required|email|max:255',
            'visibility' => 'required|in:public,private',
            'share_via_link' => 'boolean',
            'share_via_email' => 'boolean',
            'share_emails' => 'array',
            'share_emails.*' => 'email',
        ]);

        // Log the incoming share_emails for debugging
        Log::info('Creating board with share_emails:', ['emails' => $validated['share_emails'] ?? []]);

        // For free users, disable sharing features and force private visibility
        if ($userPlanLimits['isFree']) {
            $validated['visibility'] = 'private';
            $validated['share_via_link'] = false;
            $validated['share_via_email'] = false;
            $validated['share_emails'] = [];
        }

        // Ensure share_emails is an array
        $shareEmails = $validated['share_emails'] ?? [];

        $board = Board::create([
            'name' => $validated['name'],
            'user_id' => auth()->id(),
            'creator_email' => $validated['creator_email'],
            'visibility' => $validated['visibility'],
            'share_via_link' => $validated['share_via_link'] ?? false,
            'share_via_email' => $validated['share_via_email'] ?? false,
            'share_emails' => $shareEmails,
        ]);

        // Send email notifications if share_via_email is enabled (only for paid users)
        if ($board->share_via_email && !empty($shareEmails) && !$userPlanLimits['isFree']) {
            Log::info('Sending emails to:', ['emails' => $shareEmails, 'board_id' => $board->id]);
            $this->sendBoardSharedEmails($board);
        }

        // Clear user's library cache
        Board::clearUserLibraryCache(auth()->id());

        return back()->with('success', 'Board created successfully!');
    }

    /**
     * Add library to boards
     */
    public function addLibraryToBoards(Request $request)
    {
        $validated = $request->validate([
            'library_id' => 'required|exists:libraries,id',
            'board_ids_to_add' => 'array',
            'board_ids_to_add.*' => 'exists:boards,id',
            'board_ids_to_remove' => 'array',
            'board_ids_to_remove.*' => 'exists:boards,id',
        ]);

        $user = auth()->user();
        $userPlanLimits = $this->getUserPlanLimits($user);

        $boardsToAdd = $validated['board_ids_to_add'] ?? [];
        $boardsToRemove = $validated['board_ids_to_remove'] ?? [];
        $allBoardIds = array_merge($boardsToAdd, $boardsToRemove);

        // Verify user owns all the boards
        $userBoards = Board::whereIn('id', $allBoardIds)
            ->where('user_id', auth()->id())
            ->pluck('id');

        if ($userBoards->count() !== count($allBoardIds)) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'Some boards do not belong to you.'
            ], 403);
        }

        // Check library limits for free users (only for boards being added to)
        if ($userPlanLimits['isFree'] && !empty($boardsToAdd)) {
            foreach ($boardsToAdd as $boardId) {
                $board = Board::find($boardId);
                $currentLibraryCount = $board->libraries()->count();

                if ($currentLibraryCount >= $userPlanLimits['maxLibrariesPerBoard']) {
                    return response()->json([
                        'success' => false,
                        'error' => 'plan_limit',
                        'message' => 'You have reached the maximum number of interactions per board for your current plan. Upgrade to add more interactions.'
                    ], 400);
                }
            }
        }

        $addedCount = 0;
        $removedCount = 0;

        // Add library to boards
        foreach ($boardsToAdd as $boardId) {
            $board = Board::find($boardId);
            $attached = $board->libraries()->syncWithoutDetaching([$validated['library_id']]);
            if (!empty($attached['attached'])) {
                $addedCount++;
            }
        }

        // Remove library from boards
        foreach ($boardsToRemove as $boardId) {
            $board = Board::find($boardId);
            $detached = $board->libraries()->detach([$validated['library_id']]);
            if ($detached > 0) {
                $removedCount++;
            }
        }

        // Clear user's library cache after changes
        Board::clearUserLibraryCache(auth()->id());

        // Generate appropriate success message
        $message = '';
        if ($addedCount > 0 && $removedCount > 0) {
            $message = "Library added to {$addedCount} board(s) and removed from {$removedCount} board(s) successfully!";
        } elseif ($addedCount > 0) {
            $message = "Library added to {$addedCount} board(s) successfully!";
        } elseif ($removedCount > 0) {
            $message = "Library removed from {$removedCount} board(s) successfully!";
        } else {
            $message = "No changes were made.";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'added_count' => $addedCount,
            'removed_count' => $removedCount
        ]);
    }

    /**
     * Get user's boards for library selection with library check
     */
    public function getUserBoards(Request $request)
    {
        $libraryId = $request->query('library_id');
        $user = auth()->user();
        $userPlanLimits = $this->getUserPlanLimits($user);

        $boards = Board::getUserBoardsWithLibraryCheck(auth()->id(), $libraryId);

        // Add plan restrictions info to each board
        $boards = $boards->map(function ($board) use ($userPlanLimits) {
            $currentLibraryCount = Board::find($board['id'])->libraries()->count();
            $canAddLibrary = !$userPlanLimits['isFree'] || $currentLibraryCount < $userPlanLimits['maxLibrariesPerBoard'];

            return array_merge($board, [
                'can_add_library' => $canAddLibrary,
                'library_count' => $currentLibraryCount,
                'max_libraries' => $userPlanLimits['maxLibrariesPerBoard'],
                'is_free_plan' => $userPlanLimits['isFree'],
            ]);
        });

        return response()->json([
            'boards' => $boards,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    /**
     * Check if user has library in any board
     */
    public function checkLibraryInBoards(Request $request)
    {
        $validated = $request->validate([
            'library_id' => 'required|exists:libraries,id',
        ]);

        $hasLibrary = Board::checkUserHasLibrary(auth()->id(), $validated['library_id']);

        return response()->json(['has_library' => $hasLibrary]);
    }

    /**
     * Get all user's library IDs that are in boards (for bulk checking)
     */
    public function getUserLibraryIds()
    {
        if (!auth()->check()) {
            return response()->json(['library_ids' => []]);
        }

        $libraryIds = Board::getUserLibraryIds(auth()->id());

        return response()->json(['library_ids' => $libraryIds]);
    }

    /**
     * Update an existing board
     */
    public function update(Request $request, Board $board)
    {
        // Ensure user owns the board
        if ($board->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $user = auth()->user();
        $userPlanLimits = $this->getUserPlanLimits($user);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'creator_email' => 'required|email|max:255',
            'visibility' => 'required|in:public,private',
            'share_via_link' => 'boolean',
            'share_via_email' => 'boolean',
            'share_emails' => 'array',
            'share_emails.*' => 'email',
        ]);

        // Log the incoming share_emails for debugging
        Log::info('Updating board with share_emails:', ['emails' => $validated['share_emails'] ?? [], 'board_id' => $board->id]);

        // For free users, disable sharing features and force private visibility
        if ($userPlanLimits['isFree']) {
            $validated['visibility'] = 'private';
            $validated['share_via_link'] = false;
            $validated['share_via_email'] = false;
            $validated['share_emails'] = [];
        }

        // Check if share settings changed
        $wasSharedViaEmail = $board->share_via_email;
        $oldShareEmails = $board->share_emails ?? [];

        // Ensure share_emails is an array
        $newShareEmails = $validated['share_emails'] ?? [];

        $board->update($validated);

        // Refresh the board to get the updated data
        $board->refresh();

        // Send email notifications if share_via_email is newly enabled or emails changed (only for paid users)
        if ($board->share_via_email && !$userPlanLimits['isFree']) {
            $emailsChanged = !$wasSharedViaEmail || (count(array_diff($oldShareEmails, $newShareEmails)) > 0 || count(array_diff($newShareEmails, $oldShareEmails)) > 0);

            if ($emailsChanged && !empty($board->share_emails)) {
                Log::info('Sending emails after update to:', ['emails' => $board->share_emails, 'board_id' => $board->id]);
                $this->sendBoardSharedEmails($board);
            }
        }

        return back()->with('success', 'Board updated successfully!');
    }

    /**
     * Delete a board
     */
    public function destroy(Board $board)
    {
        // Ensure user owns the board
        if ($board->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $board->delete();

        // Clear user's library cache after deleting
        Board::clearUserLibraryCache(auth()->id());

        return back()->with('success', 'Board deleted successfully!');
    }

    /**
     * Show board with its libraries
     */
    public function show(Request $request, Board $board): Response|RedirectResponse
    {
        // Ensure user owns the board
        if ($board->user_id !== auth()->id()) {
            return redirect()->route('collections.index')->withErrors(['error' => 'Unauthorized']);
        }
        $userPlanLimits = null;
        $currentPlan = null;
        $user = auth()->user();
        $userPlanLimits = $this->getUserPlanLimits($user);
        $currentPlan = $this->getCurrentPlan($user);


        $viewedLibraryIds = $this->getViewedLibraryIds($request);


        $allLibraries = $board->libraries()
            ->with(['categories', 'platforms', 'industries', 'interactions'])
            ->orderBy('board_library.created_at', 'desc')
            ->get();

        // Apply blurring for free users if they exceed library limit
        $libraries = $allLibraries->map(function ($library, $index) use ($userPlanLimits) {
            $isBlurred = $userPlanLimits['isFree'] && $index >= $userPlanLimits['maxLibrariesPerBoard'];

            return [
                'id' => $library->id,
                'title' => $library->title,
                'seo_title' => $library->seo_title,
                'slug' => $library->slug,
                'url' => $library->url,
                'video_url' => $library->video_url,
                'description' => $library->description,
                'logo' => $library->logo,
                'platforms' => $library->platforms,
                'categories' => $library->categories,
                'industries' => $library->industries,
                'interactions' => $library->interactions,
                'is_blurred' => $isBlurred,
            ];
        });

        $filters = $this->getFilters();

        // Get user's library IDs for authenticated users (same as in index method)
        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return Inertia::render('BoardDetail', [
            'board' => [
                'id' => $board->id,
                'name' => $board->name,
                'creator_email' => $board->creator_email,
                'visibility' => $board->visibility,
                'share_via_link' => $board->share_via_link,
                'share_via_email' => $board->share_via_email,
                'share_emails' => $board->share_emails,
                'share_url' => $board->getShareUrl(),
                'created_at' => $board->created_at->format('M j, Y'),
            ],
            'libraries' => $libraries,
            'filters' => $filters,
            'userLibraryIds' => $userLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'viewedLibraryIds' => $viewedLibraryIds,
        ]);
    }

    public function shared(Request $request, string $token): Response
    {
        $currentPlan = null;
        $user = auth()->user();
        $currentPlan = $this->getCurrentPlan($user);

        $board = Board::where('share_token', $token)
            ->whereNotNull('share_token')
            ->where(function($query) {
                $query->where('share_via_link', true)
                    ->orWhere('share_via_email', true);
            })
            ->with('user')
            ->firstOrFail();

        // Check if board is private and user is not the owner
        $isOwner = auth()->check() && auth()->id() === $board->user_id;
        $isPrivate = $board->visibility === 'private';

        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // If board is private and user is not the owner, show access denied message
        if ($isPrivate && !$isOwner) {
            $filters = $this->getFilters();

            return Inertia::render('SharedBoard', [
                'board' => [
                    'id' => $board->id,
                    'name' => $board->name,
                    'creator_email' => $board->creator_email,
                    'creator_name' => $board->user->name ?? 'Unknown User',
                    'visibility' => $board->visibility,
                    'created_at' => $board->created_at->format('M j, Y'),
                ],
                'libraries' => [],
                'filters' => $filters,
                'userLibraryIds' => $userLibraryIds,
                'viewedLibraryIds' => $viewedLibraryIds,
                'userPlanLimits' => auth()->check() ? $this->getUserPlanLimits(auth()->user()) : null,
                'currentPlan' => $currentPlan,
                'isPrivate' => true,
                'isOwner' => false,
            ]);
        }

        // Board is public or user is owner - show full content
        $libraries = $board->libraries()
            ->with(['categories', 'platforms', 'industries', 'interactions'])
            ->orderBy('board_library.created_at', 'desc')
            ->get()
            ->map(function ($library) {
                return [
                    'id' => $library->id,
                    'title' => $library->title,
                    'seo_title' => $library->seo_title,
                    'slug' => $library->slug,
                    'url' => $library->url,
                    'video_url' => $library->video_url,
                    'description' => $library->description,
                    'logo' => $library->logo,
                    'platforms' => $library->platforms,
                    'categories' => $library->categories,
                    'industries' => $library->industries,
                    'interactions' => $library->interactions,
                ];
            });

        $filters = $this->getFilters();
        $isAuthenticated = auth()->check();
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return Inertia::render('SharedBoard', [
            'board' => [
                'id' => $board->id,
                'name' => $board->name,
                'creator_email' => $board->creator_email,
                'creator_name' => $board->user->name ?? 'Unknown User',
                'visibility' => $board->visibility,
                'created_at' => $board->created_at->format('M j, Y'),
            ],
            'libraries' => $libraries,
            'filters' => $filters,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'isPrivate' => false,
            'isOwner' => $isOwner,
        ]);
    }

    /**
     * Get user plan limits and restrictions (now using User model methods)
     */
    private function getUserPlanLimits(User $user): array
    {
        return $user->getPlanLimits();
    }

    /**
     * Send board shared emails
     */
    private function sendBoardSharedEmails(Board $board)
    {
        // Ensure share_emails is an array
        $shareEmails = is_array($board->share_emails) ? $board->share_emails : [];

        if (empty($shareEmails)) {
            Log::warning('No emails to send for board', ['board_id' => $board->id]);
            return;
        }

        // Load the user relationship to get the creator name
        $board->load('user');

        Log::info('Starting to send emails', [
            'board_id' => $board->id,
            'email_count' => count($shareEmails),
            'emails' => $shareEmails
        ]);

        $successCount = 0;
        $failCount = 0;

        foreach ($shareEmails as $email) {
            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Log::warning('Invalid email format', ['email' => $email, 'board_id' => $board->id]);
                $failCount++;
                continue;
            }

            try {
                Mail::to($email)->send(new BoardShared($board));
                $successCount++;
                Log::info('Email sent successfully', ['email' => $email, 'board_id' => $board->id]);
            } catch (\Exception $e) {
                $failCount++;
                Log::error('Failed to send board shared email', [
                    'email' => $email,
                    'board_id' => $board->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        Log::info('Email sending completed', [
            'board_id' => $board->id,
            'success' => $successCount,
            'failed' => $failCount,
            'total' => count($shareEmails)
        ]);
    }

    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(),
        ];
    }
}
