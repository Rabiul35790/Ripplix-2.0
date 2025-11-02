<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Library;
use App\Models\LibraryView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search libraries with infinite scroll support
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

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $platform = $request->get('platform', '');
        $page = $request->get('page', 1);
        $isAuthenticated = auth()->check();

        // Different pagination logic for authenticated vs unauthenticated users
        $perPage = $isAuthenticated ? 20 : 12; // 20 for auth users, 12 for unauth

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
            $libraries = $searchQuery->take(12)->get();
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
}
