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
     * Show search results page
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

        // Different pagination for auth vs unauth users
        $perPage = $isAuthenticated ? 20 : 18;

        // Get filters from database
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

        if (empty($query)) {
            return Inertia::render('SearchResults', [
                'libraries' => [],
                'searchQuery' => $query,
                'selectedPlatform' => $platform,
                'totalCount' => 0,
                'hasMore' => false,
                'currentPage' => 1,
                'isAuthenticated' => $isAuthenticated,
                'filters' => $filters,
                'userLibraryIds' => $userLibraryIds,
                'viewedLibraryIds' => $viewedLibraryIds,
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Build the search query
        $searchQuery = Library::with(['platforms', 'categories', 'industries', 'interactions'])
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
        if (!empty($platform) && $platform !== 'All') {
            $searchQuery->whereHas('platforms', function ($q) use ($platform) {
                $q->where('name', $platform);
            });
        }

        // Get total count
        $totalCount = $searchQuery->count();

        // Different logic for authenticated vs unauthenticated users
        if (!$isAuthenticated) {
            // For unauthenticated users, limit to 12 results max
            $libraries = $searchQuery->take(18)->get();
            $hasMore = false; // Never show "load more" for unauthenticated users
        } else {
            // For authenticated users, normal pagination
            $libraries = $searchQuery->take($perPage)->get();
            $hasMore = $libraries->count() >= $perPage && $totalCount > $perPage;
        }

        return Inertia::render('SearchResults', [
            'libraries' => $libraries,
            'searchQuery' => $query,
            'selectedPlatform' => $platform,
            'totalCount' => $totalCount,
            'hasMore' => $hasMore,
            'currentPage' => 1,
            'isAuthenticated' => $isAuthenticated,
            'filters' => $filters,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    /**
     * API Search endpoint (for SearchModal) - Updated from previous version
     */
    public function apiSearch(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $platform = $request->get('platform', '');
        $page = $request->get('page', 1);
        $isAuthenticated = auth()->check();

        // Different pagination logic for authenticated vs unauthenticated users
        $perPage = $isAuthenticated ? 20 : 18; // 20 for auth users, 12 for unauth

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

        // Build the search query
        $searchQuery = Library::with(['platforms', 'categories', 'industries', 'interactions'])
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
        if (!empty($platform) && $platform !== 'All') {
            $searchQuery->whereHas('platforms', function ($q) use ($platform) {
                $q->where('name', $platform);
            });
        }

        // Get total count
        $totalCount = $searchQuery->count();

        // For unauthenticated users, only return the first page with max 12 results
        // For authenticated users, handle normal pagination
        if (!$isAuthenticated) {
            // Always return first 12 results for unauthenticated users
            $libraries = $searchQuery->take(18)->get();
            $hasMore = false; // Never show "has more" for unauthenticated users
            $currentPage = 1;
        } else {
            // Normal pagination for authenticated users
            $libraries = $searchQuery->skip(($page - 1) * $perPage)
                                    ->take($perPage)
                                    ->get();

            // Calculate if there are more results
            $hasMore = ($page * $perPage) < $totalCount;
            $currentPage = (int) $page;
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
        $page = $request->get('page', 1);
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
                'userPlanLimits' => $userPlanLimits,
            ]);
        }

        // Build the search query
        $searchQuery = Library::with(['platforms', 'categories', 'industries', 'interactions'])
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
        if (!empty($platform) && $platform !== 'All') {
            $searchQuery->whereHas('platforms', function ($q) use ($platform) {
                $q->where('name', $platform);
            });
        }

        // Get total count
        $totalCount = $searchQuery->count();

        // Get paginated results
        $libraries = $searchQuery->skip(($page - 1) * $perPage)
                                ->take($perPage)
                                ->get();

        // Calculate if there are more results
        $hasMore = ($page * $perPage) < $totalCount;

        return response()->json([
            'libraries' => $libraries,
            'has_more' => $hasMore,
            'current_page' => (int) $page,
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
