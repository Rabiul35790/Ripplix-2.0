<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\LibraryView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Library;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;

use App\Models\CategoryFollow;
use App\Models\User;

class BrowseController extends Controller
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
    public function allApps(Request $request)
    {
        // Get all categories
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Apply category filter if provided
        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);

        $filterType = null;
        $filterValue = null;
        $filterName = null;
        $categoryData = null;

        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                });
                $filterType = 'category';
                $filterValue = $category->slug;
                $filterName = $category->name;

                // Add follow status if user is authenticated
                $categoryData = $category->toArray();
                if (auth()->check()) {
                    $categoryData['is_following'] = $category->isFollowedBy(auth()->id());
                } else {
                    $categoryData['is_following'] = false;
                }
            }
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $isAuthenticated = auth()->check();
        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        return Inertia::render('AllApps', [
            'libraries' => $libraries,
            'categories' => $categories,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'categoryData' => $categoryData,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    public function allCategories(Request $request)
    {
        // Get all industries
        $industries = Industry::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Apply industry filter if provided
        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);

        $filterType = null;
        $filterValue = null;
        $filterName = null;

        if ($request->has('industry') && $request->industry !== 'all') {
            $industry = Industry::where('slug', $request->industry)->first();
            if ($industry) {
                $query->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                });
                $filterType = 'industry';
                $filterValue = $industry->slug;
                $filterName = $industry->name;
            }
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        $isAuthenticated = auth()->check();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        return Inertia::render('AllCategories', [
            'libraries' => $libraries,
            'industries' => $industries,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
        ]);
    }

    public function allElements(Request $request)
    {
        // Get all interactions
        $interactions = Interaction::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Apply interaction filter if provided
        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);

        $filterType = null;
        $filterValue = null;
        $filterName = null;

        if ($request->has('interaction') && $request->interaction !== 'all') {
            $interaction = Interaction::where('slug', $request->interaction)->first();
            if ($interaction) {
                $query->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                });
                $filterType = 'interaction';
                $filterValue = $interaction->slug;
                $filterName = $interaction->name;
            }
        }

        $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        $isAuthenticated = auth()->check();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        return Inertia::render('AllElements', [
            'libraries' => $libraries,
            'interactions' => $interactions,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
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
