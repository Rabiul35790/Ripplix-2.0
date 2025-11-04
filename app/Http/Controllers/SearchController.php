<?php

namespace App\Http\Controllers;

use App\Models\Library;
use App\Models\LibraryView;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Show search results page - OPTIMIZED for instant navigation
     */
    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }

    private function getUserPlanLimits(?User $user): ?array
    {
        if (!$user) {
            return null;
        }
        return $user->getPlanLimits();
    }

    public function index(Request $request): Response
    {
        $query = $request->get('q', '');
        $platform = $request->get('platform', '');
        $isAuthenticated = auth()->check();

        // Get filters from database (lightweight)
        $filters = $this->getFilters();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get quick count only (no heavy queries)
        $totalCount = 0;
        if (!empty($query)) {
            $countQuery = Library::where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhereHas('interactions', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  })
                  ->orWhereHas('categories', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  })
                  ->orWhereHas('industries', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  });
            });

            // Filter by platform if specified
            if (!empty($platform) && $platform !== 'All') {
                $countQuery->whereHas('platforms', function ($q) use ($platform) {
                    $q->where('name', $platform);
                });
            }

            $totalCount = $countQuery->count();
        }

        // Return MINIMAL data for instant navigation
        return Inertia::render('SearchResults', [
            'libraries' => [], // Empty - will be loaded via API
            'searchQuery' => $query,
            'selectedPlatform' => $platform,
            'totalCount' => $totalCount,
            'hasMore' => false,
            'currentPage' => 1,
            'isAuthenticated' => $isAuthenticated,
            'filters' => $filters,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    /**
     * API Search endpoint - OPTIMIZED with select and pagination
     */
    public function apiSearch(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $platform = $request->get('platform', '');
        $page = (int) $request->get('page', 1);
        $isAuthenticated = auth()->check();

        // Different pagination logic for authenticated vs unauthenticated users
        $perPage = $isAuthenticated ? 20 : 18;

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        if (empty($query)) {
            return response()->json([
                'libraries' => [],
                'has_more' => false,
                'current_page' => 1,
                'total_count' => 0,
                'userLibraryIds' => $userLibraryIds,
                'viewedLibraryIds' => $viewedLibraryIds,
                'is_authenticated' => $isAuthenticated,
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Build the search query with optimized select
        $searchQuery = Library::select([
                'libraries.id',
                'libraries.title',
                'libraries.slug',
                'libraries.url',
                'libraries.video_url',
                'libraries.description',
                'libraries.logo',
                'libraries.created_at',
                'libraries.published_date'
            ])
            ->with([
                'platforms:id,name',
                'categories:id,name,slug,image',
                'industries:id,name,slug',
                'interactions:id,name,slug'
            ])
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                ->orWhere('description', 'LIKE', "%{$query}%")
                ->orWhereHas('interactions', function ($subQuery) use ($query) {
                    $subQuery->where('name', 'LIKE', "%{$query}%");
                })
                ->orWhereHas('categories', function ($subQuery) use ($query) {
                    $subQuery->where('name', 'LIKE', "%{$query}%");
                })
                ->orWhereHas('industries', function ($subQuery) use ($query) {
                    $subQuery->where('name', 'LIKE', "%{$query}%");
                });
            });

        // Filter by platform if specified
        if (!empty($platform) && $platform !== 'All' && $platform !== 'all') {
            $searchQuery->whereHas('platforms', function ($q) use ($platform) {
                $q->where('name', $platform);
            });
        }

        // Get total count
        $totalCount = $searchQuery->count();

        // For unauthenticated users, only return the first page with max 18 results
        // For authenticated users, handle normal pagination
        if (!$isAuthenticated) {
            $libraries = $searchQuery->latest('libraries.created_at')
                ->take(18)
                ->get();
            $hasMore = false;
            $currentPage = 1;
        } else {
            $libraries = $searchQuery->latest('libraries.created_at')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            $hasMore = ($page * $perPage) < $totalCount;
            $currentPage = $page;
        }

        return response()->json([
            'libraries' => $libraries,
            'has_more' => $hasMore,
            'current_page' => $currentPage,
            'total_count' => $totalCount,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'is_authenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    /**
     * Load more search results (AJAX endpoint) - Only for authenticated users
     */
    public function loadMore(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $platform = $request->get('platform', '');
        $page = (int) $request->get('page', 1);
        $perPage = 24;
        $isAuthenticated = auth()->check();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Only allow load more for authenticated users
        if (!$isAuthenticated) {
            return response()->json([
                'libraries' => [],
                'has_more' => false,
                'current_page' => 1,
                'userLibraryIds' => [],
                'viewedLibraryIds' => $viewedLibraryIds,
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Get user's library IDs for authenticated users
        $userLibraryIds = Board::getUserLibraryIds(auth()->id());

        if (empty($query)) {
            return response()->json([
                'libraries' => [],
                'has_more' => false,
                'current_page' => 1,
                'userLibraryIds' => $userLibraryIds,
                'viewedLibraryIds' => $viewedLibraryIds,
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Build the search query with optimized select
        $searchQuery = Library::select([
                'libraries.id',
                'libraries.title',
                'libraries.slug',
                'libraries.url',
                'libraries.video_url',
                'libraries.description',
                'libraries.logo',
                'libraries.created_at',
                'libraries.published_date'
            ])
            ->with([
                'platforms:id,name',
                'categories:id,name,slug,image',
                'industries:id,name,slug',
                'interactions:id,name,slug'
            ])
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhereHas('interactions', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  })
                  ->orWhereHas('categories', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  })
                  ->orWhereHas('industries', function ($subQuery) use ($query) {
                      $subQuery->where('name', 'LIKE', "%{$query}%");
                  });
            });

        // Filter by platform if specified
        if (!empty($platform) && $platform !== 'All' && $platform !== 'all') {
            $searchQuery->whereHas('platforms', function ($q) use ($platform) {
                $q->where('name', $platform);
            });
        }

        // Get total count
        $totalCount = $searchQuery->count();

        // Get paginated results
        $libraries = $searchQuery->latest('libraries.created_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Calculate if there are more results
        $hasMore = ($page * $perPage) < $totalCount;

        return response()->json([
            'libraries' => $libraries,
            'has_more' => $hasMore,
            'current_page' => $page,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    /**
     * Get filters from database
     */
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
