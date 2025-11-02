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

    public function index(Request $request)
    {
        // Get filters for layout
        $filters = $this->getFilters();

        // Get all libraries for layout (needed by Layout component)
        $libraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->latest()
            ->get();

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }
        $isAuthenticated = auth()->check();
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // If user is not authenticated, return with empty data
        if (!auth()->check()) {
            return Inertia::render('Following', [
                'libraries' => $libraries,
                'filters' => $filters,
                'followedCategories' => [],
                'userLibraryIds' => $userLibraryIds,
                'viewedLibraryIds' => $viewedLibraryIds,
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Get user's followed categories with their libraries
        $followedCategories = Category::whereHas('follows', function($query) {
            $query->where('user_id', auth()->id());
        })
        ->with(['libraries' => function($query) {
            $query->with(['platforms', 'categories', 'industries', 'interactions'])
                ->where('is_active', true)
                ->latest();
        }])
        ->where('is_active', true)
        ->orderBy('name')
        ->get();

        return Inertia::render('Following', [
            'libraries' => $libraries,
            'filters' => $filters,
            'followedCategories' => $followedCategories,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
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
