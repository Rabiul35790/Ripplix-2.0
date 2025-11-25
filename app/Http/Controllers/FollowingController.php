<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\LibraryView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Library;
use App\Models\Category;
use App\Models\CategoryFollow;
use App\Models\Platform;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FollowingController extends Controller
{
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

    private function getCurrentPlan($user)
    {
        if (!$user) {
            return null;
        }

        // Get current plan details
        if ($user->pricingPlan) {
            return [
                'id' => $user->pricingPlan->id,
                'name' => $user->pricingPlan->name,
                'slug' => $user->pricingPlan->slug ?? null,
                'price' => $user->pricingPlan->price ?? 0,
                'billing_period' => $user->pricingPlan->billing_period ?? 'monthly',
                'expires_at' => $user->subscription_ends_at ?? null,
                'days_until_expiry' => $user->daysUntilExpiry(),
            ];
        }

        return null;
    }

    public function index(Request $request)
    {
        // Get filters for layout (lightweight)
        $filters = $this->getFilters();

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $isAuthenticated = auth()->check();
        $user = auth()->user();
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Return minimal data for initial render
        // Libraries will be loaded on-demand
        return Inertia::render('Following', [
            'libraries' => [], // Empty for faster initial load
            'filters' => $filters,
            'followedCategories' => [], // Will be loaded via API
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $this->getCurrentPlan($user),
            'initialLoad' => true, // Flag to trigger API call
        ]);
    }

    // New API endpoint for lazy loading followed categories
    public function getFollowedCategories(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([
                'followedCategories' => [],
                'success' => true
            ]);
        }

        // Get platform filter if provided
        $platformFilter = $request->input('platform', 'all');

        // Get user's followed categories with their libraries
        $query = Category::whereHas('follows', function($query) {
            $query->where('user_id', auth()->id());
        })
        ->with(['libraries' => function($query) use ($platformFilter) {
            $query->with(['platforms', 'categories', 'industries', 'interactions'])
                ->where('is_active', true)
                ->when($platformFilter !== 'all', function($q) use ($platformFilter) {
                    $q->whereHas('platforms', function($platformQuery) use ($platformFilter) {
                        $platformQuery->where(function($pq) use ($platformFilter) {
                            if (!is_numeric($platformFilter)) {
                                $pq->whereRaw('LOWER(name) = ?', [strtolower($platformFilter)]);
                            } else {
                                $pq->where('id', $platformFilter);
                            }
                        });
                    });
                })
                ->latest()
                ->limit(3); // Only get latest 3 per category
        }])
        ->where('is_active', true)
        ->orderBy('name')
        ->get();

        return response()->json([
            'followedCategories' => $query,
            'success' => true
        ]);
    }

    // New API endpoint for getting all libraries (for layout search)
    public function getAllLibraries(Request $request)
    {
        $libraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'libraries' => $libraries,
            'success' => true
        ]);
    }

    public function followCategory(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id'
        ]);

        $userId = auth()->id();
        $categoryId = $request->category_id;

        // Check if already following
        $existingFollow = CategoryFollow::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->first();

        if ($existingFollow) {
            return response()->json(['error' => 'Already following this category'], 400);
        }

        // Create follow relationship
        CategoryFollow::create([
            'user_id' => $userId,
            'category_id' => $categoryId
        ]);

        return response()->json(['success' => true, 'message' => 'Category followed successfully']);
    }

    public function unfollowCategory(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id'
        ]);

        $userId = auth()->id();
        $categoryId = $request->category_id;

        // Remove follow relationship
        $deleted = CategoryFollow::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Not following this category'], 400);
        }

        return response()->json(['success' => true, 'message' => 'Category unfollowed successfully']);
    }

    public function getFollowStatus(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['isFollowing' => false]);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id'
        ]);

        $isFollowing = CategoryFollow::where('user_id', auth()->id())
            ->where('category_id', $request->category_id)
            ->exists();

        return response()->json(['isFollowing' => $isFollowing]);
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
