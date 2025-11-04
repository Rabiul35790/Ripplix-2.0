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

    // OPTIMIZED: allApps - instant navigation
    public function allApps(Request $request)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get all categories (lightweight query)
        $categories = Category::select(['id', 'name', 'slug', 'image'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        // Get lightweight filters
        $filters = $this->getFilters();

        $filterType = null;
        $filterValue = null;
        $filterName = null;
        $categoryData = null;

        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first(['id', 'name', 'slug']);
            if ($category) {
                $filterType = 'category';
                $filterValue = $category->slug;
                $filterName = $category->name;

                $categoryData = $category->toArray();
                if ($isAuthenticated) {
                    $categoryData['is_following'] = $category->isFollowedBy(auth()->id());
                } else {
                    $categoryData['is_following'] = false;
                }
            }
        }

        // Return MINIMAL data for instant navigation
        return Inertia::render('AllApps', [
            'libraries' => [], // Empty - will be loaded via API if needed
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

    // NEW: API endpoint to load libraries for allApps
    public function getAllAppsLibraries(Request $request)
    {
        $query = Library::select([
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
                'categories:id,name,image',
                'industries:id,name',
                'interactions:id,name'
            ])
            ->where('libraries.is_active', true);

        // Apply category filter if provided
        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first(['id']);
            if ($category) {
                $query->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                });
            }
        }

        $libraries = $query->latest('libraries.created_at')->get();

        return response()->json([
            'libraries' => $libraries
        ]);
    }

    // OPTIMIZED: allCategories - instant navigation
    public function allCategories(Request $request)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get all industries (lightweight query)
        $industries = Industry::select(['id', 'name', 'slug'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Get lightweight filters
        $filters = $this->getFilters();

        $filterType = null;
        $filterValue = null;
        $filterName = null;

        if ($request->has('industry') && $request->industry !== 'all') {
            $industry = Industry::where('slug', $request->industry)->first(['id', 'name', 'slug']);
            if ($industry) {
                $filterType = 'industry';
                $filterValue = $industry->slug;
                $filterName = $industry->name;
            }
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        // Return MINIMAL data for instant navigation
        return Inertia::render('AllCategories', [
            'libraries' => [], // Empty - will be loaded via API if needed
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

    // NEW: API endpoint to load libraries for allCategories
    public function getAllCategoriesLibraries(Request $request)
    {
        $query = Library::select([
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
                'categories:id,name',
                'industries:id,name',
                'interactions:id,name'
            ])
            ->where('libraries.is_active', true);

        // Apply industry filter if provided
        if ($request->has('industry') && $request->industry !== 'all') {
            $industry = Industry::where('slug', $request->industry)->first(['id']);
            if ($industry) {
                $query->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                });
            }
        }

        $libraries = $query->latest('libraries.created_at')->get();

        return response()->json([
            'libraries' => $libraries
        ]);
    }

    // OPTIMIZED: allElements - instant navigation
    public function allElements(Request $request)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get all interactions (lightweight query)
        $interactions = Interaction::select(['id', 'name', 'slug'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get lightweight filters
        $filters = $this->getFilters();

        $filterType = null;
        $filterValue = null;
        $filterName = null;

        if ($request->has('interaction') && $request->interaction !== 'all') {
            $interaction = Interaction::where('slug', $request->interaction)->first(['id', 'name', 'slug']);
            if ($interaction) {
                $filterType = 'interaction';
                $filterValue = $interaction->slug;
                $filterName = $interaction->name;
            }
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        // Return MINIMAL data for instant navigation
        return Inertia::render('AllElements', [
            'libraries' => [], // Empty - will be loaded via API if needed
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

    // NEW: API endpoint to load libraries for allElements
    public function getAllElementsLibraries(Request $request)
    {
        $query = Library::select([
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
                'categories:id,name',
                'industries:id,name',
                'interactions:id,name'
            ])
            ->where('libraries.is_active', true);

        // Apply interaction filter if provided
        if ($request->has('interaction') && $request->interaction !== 'all') {
            $interaction = Interaction::where('slug', $request->interaction)->first(['id']);
            if ($interaction) {
                $query->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                });
            }
        }

        $libraries = $query->latest('libraries.created_at')->get();

        return response()->json([
            'libraries' => $libraries
        ]);
    }

    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(['id', 'name', 'slug']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'image']),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }
}
