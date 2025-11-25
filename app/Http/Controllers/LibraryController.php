<?php

namespace App\Http\Controllers;

use App\Models\LibraryView;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Library;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Board;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LibraryController extends Controller
{
    const CACHE_TTL = 1800; // 30 minutes
    const LIBRARIES_PER_PAGE = 18;


    private function getUserPlanLimits(?User $user): ?array
    {
        if (!$user) {
            return null;
        }
        return $user->getPlanLimits();
    }

    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }

public function index(Request $request)
{
    $page = (int) $request->get('page', 1);
    $perPage = self::LIBRARIES_PER_PAGE;
    $isAuthenticated = auth()->check();

    // Get user plan limits
    $userPlanLimits = null;
    if ($isAuthenticated) {
        $userPlanLimits = $this->getUserPlanLimits(auth()->user());
    }

    // Get platform filter
    $platformFilter = $request->get('platform', 'all');

    // Build optimized query with specific columns only
    $query = Library::select([
            'libraries.id',
            'libraries.title',
            'libraries.published_date',
            'libraries.slug',
            'libraries.url',
            'libraries.video_url',
            'libraries.description',
            'libraries.logo',
            'libraries.created_at'
        ])
        ->with([
            'platforms:id,name',
            'categories:id,name,image,slug,is_top',
            'industries:id,name,is_top',
            'interactions:id,name,is_top'
        ])
        ->where('libraries.is_active', true);

    // Apply platform filter if not 'all'
    if ($platformFilter !== 'all') {
        $query->whereHas('platforms', function($q) use ($platformFilter) {
            $q->where('name', 'like', '%' . $platformFilter . '%');
        });
    }

    // Changed from latest() to inRandomOrder()
    $query->inRandomOrder();

    // Get total count for pagination
    $total = $query->count();

    // Calculate offset and get libraries for current page
    $offset = ($page - 1) * $perPage;
    $libraries = $query->offset($offset)->limit($perPage)->get();

    $viewedLibraryIds = $this->getViewedLibraryIds($request);

    $paginationData = [
        'current_page' => $page,
        'last_page' => ceil($total / $perPage),
        'per_page' => $perPage,
        'total' => $total,
        'has_more' => $page < ceil($total / $perPage)
    ];

    // Get lightweight filters
    $filters = $this->getFilters();

    // Get user's library IDs for authenticated users
    $userLibraryIds = [];
    if ($isAuthenticated) {
        $userLibraryIds = Board::getUserLibraryIds(auth()->id());
    }

    $settings = Setting::getInstance();

    // Get all libraries for modal navigation (only for authenticated users)
    $allLibraries = [];
    if ($isAuthenticated) {
        $allLibraries = Library::select(['id', 'slug', 'title'])
            ->where('is_active', true)
            ->inRandomOrder()
            ->get();
    }

    // For initial page load, return page WITHOUT top libraries (load them via API)
    if ($page === 1 && !$request->wantsJson()) {
        return Inertia::render('Home', [
            'libraries' => $libraries,
            'filters' => $filters,
            'total' => $total,
            'selectedLibrary' => null,
            'allLibraries' => $allLibraries,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'pagination' => $paginationData,
            'currentPlatformFilter' => $platformFilter,
            'topLibrariesByCategory' => [], // Empty - will load via API
            'topLibrariesByInteraction' => [], // Empty - will load via API
            'topLibrariesByIndustry' => [], // Empty - will load via API
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'isAuthenticated' => $isAuthenticated,
            'settings' => [
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/' . $settings->favicon) : null,
                'authentication_page_image' => $settings->authentication_page_image ? asset('storage/' . $settings->authentication_page_image) : null,
                'copyright_text' => $settings->copyright_text,
                'hero_image' => $settings->hero_image ? asset('storage/' . $settings->hero_image) : null,
            ]
        ]);
    }

    // For AJAX requests (pagination), return JSON
    return response()->json([
        'libraries' => $libraries,
        'pagination' => $paginationData,
        'userLibraryIds' => $userLibraryIds,
        'viewedLibraryIds' => $viewedLibraryIds,
        'userPlanLimits' => $userPlanLimits,
    ]);
}

// Add this new method for loading top libraries via API
public function getTopLibraries(Request $request)
{
    $topLibrariesByCategory = [];
    $topLibrariesByInteraction = [];
    $topLibrariesByIndustry = [];

    // Get libraries with top categories (limit to 3 per category)
    $topCategories = Category::where('is_top', 1)->get(['id', 'name', 'slug', 'image']);

    foreach ($topCategories as $category) {
        $totalCount = Library::whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            })
            ->where('is_active', true)
            ->count();

        $topLibrariesByCategory[] = [
            'name' => $category->name,
            'slug' => $category->slug,
            'image' => $category->image,
            'total_count' => $totalCount,
            'libraries' => Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name',
                    'categories:id,name',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get()
        ];
    }

    // Get libraries with top interactions (limit to 3 per interaction)
    $topInteractions = Interaction::where('is_top', 1)->get(['id', 'name', 'slug']);

    foreach ($topInteractions as $interaction) {
        $totalCount = Library::whereHas('interactions', function($q) use ($interaction) {
                $q->where('interactions.id', $interaction->id);
            })
            ->where('is_active', true)
            ->count();

        $topLibrariesByInteraction[] = [
            'name' => $interaction->name,
            'slug' => $interaction->slug,
            'total_count' => $totalCount,
            'libraries' => Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name',
                    'categories:id,name',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get()
        ];
    }

    // Get libraries with top industries (limit to 3 per industry)
    $topIndustries = Industry::where('is_top', 1)->get(['id', 'name', 'slug']);

    foreach ($topIndustries as $industry) {
        $totalCount = Library::whereHas('industries', function($q) use ($industry) {
                $q->where('industries.id', $industry->id);
            })
            ->where('is_active', true)
            ->count();

        $topLibrariesByIndustry[] = [
            'name' => $industry->name,
            'slug' => $industry->slug,
            'total_count' => $totalCount,
            'libraries' => Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name',
                    'categories:id,name',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get()
        ];
    }

    return response()->json([
        'topLibrariesByCategory' => $topLibrariesByCategory,
        'topLibrariesByInteraction' => $topLibrariesByInteraction,
        'topLibrariesByIndustry' => $topLibrariesByIndustry,
    ]);
}


    // New method for loading more libraries via AJAX with filter support
    public function loadMore(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = self::LIBRARIES_PER_PAGE;
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get platform filter from request
        $platformFilter = $request->get('platform', 'all');

        // Build optimized query with specific columns
        $query = Library::select([
                'libraries.id',
                'libraries.title',
                'libraries.slug',
                'libraries.url',
                'libraries.video_url',
                'libraries.description',
                'libraries.logo',
                'libraries.created_at'
            ])
            ->with([
                'platforms:id,name',
                'categories:id,name,image,slug',
                'industries:id,name',
                'interactions:id,name'
            ])
            ->where('libraries.is_active', true);

        // Apply platform filter if not 'all'
        if ($platformFilter !== 'all') {
            $query->whereHas('platforms', function($q) use ($platformFilter) {
                $q->where('name', 'like', '%' . $platformFilter . '%');
            });
        }

        // Changed from latest() to inRandomOrder()
        $query->inRandomOrder();

        $total = $query->count();
        $offset = ($page - 1) * $perPage;
        $libraries = $query->offset($offset)->limit($perPage)->get();

        $paginationData = [
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
            'has_more' => $page < ceil($total / $perPage)
        ];

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        return response()->json([
            'libraries' => $libraries,
            'pagination' => $paginationData,
            'userLibraryIds' => $userLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'viewedLibraryIds' => $viewedLibraryIds,
        ]);
    }

    // MODIFIED: Load minimal data for instant navigation

public function browse(Request $request)
{
    $isAuthenticated = auth()->check();

    $userPlanLimits = null;
    if ($isAuthenticated) {
        $userPlanLimits = $this->getUserPlanLimits(auth()->user());
    }

    $filterType = null;
    $filterValue = null;
    $filterName = null;
    $categoryData = null;

    // Quick filter metadata lookup (no heavy queries yet)
    if ($request->has('category') && $request->category !== 'all') {
        $category = Category::where('slug', $request->category)->first();
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

            // Add variant name if category belongs to a variant
            $variant = $category->variants()->where('is_active', true)->first();
            $categoryData['variant_name'] = $variant ? $variant->name : null;
        }
    }

    if ($request->has('industry') && $request->industry !== 'all') {
        $industry = Industry::where('slug', $request->industry)->first();
        if ($industry) {
            $filterType = 'industry';
            $filterValue = $industry->slug;
            $filterName = $industry->name;
        }
    }

    if ($request->has('interaction') && $request->interaction !== 'all') {
        $interaction = Interaction::where('slug', $request->interaction)->first();
        if ($interaction) {
            $filterType = 'interaction';
            $filterValue = $interaction->slug;
            $filterName = $interaction->name;
        }
    }

    // Get lightweight filters
    $filters = $this->getFilters();

    // Get total count only (faster than loading all data)
    $countQuery = Library::where('is_active', true);

    // Apply filters to count
    if ($filterType === 'category' && $filterValue) {
        $category = Category::where('slug', $filterValue)->first();
        if ($category) {
            $countQuery->whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            });
        }
    }

    if ($filterType === 'industry' && $filterValue) {
        $industry = Industry::where('slug', $filterValue)->first();
        if ($industry) {
            $countQuery->whereHas('industries', function($q) use ($industry) {
                $q->where('industries.id', $industry->id);
            });
        }
    }

    if ($filterType === 'interaction' && $filterValue) {
        $interaction = Interaction::where('slug', $filterValue)->first();
        if ($interaction) {
            $countQuery->whereHas('interactions', function($q) use ($interaction) {
                $q->where('interactions.id', $interaction->id);
            });
        }
    }

    $totalLibraryCount = $countQuery->count();

    $userLibraryIds = [];
    if ($isAuthenticated) {
        $userLibraryIds = Board::getUserLibraryIds(auth()->id());
    }

    $viewedLibraryIds = $this->getViewedLibraryIds($request);

    // Return MINIMAL data for instant navigation
    return Inertia::render('Browse', [
        'libraries' => [], // Empty - will be loaded via API
        'filters' => $filters,
        'filterType' => $filterType,
        'filterValue' => $filterValue,
        'filterName' => $filterName,
        'categoryData' => $categoryData,
        'selectedLibrary' => null,
        'allLibraries' => [], // Empty - will be loaded via API
        'userLibraryIds' => $userLibraryIds,
        'viewedLibraryIds' => $viewedLibraryIds,
        'isAuthenticated' => $isAuthenticated,
        'userPlanLimits' => $userPlanLimits,
        'totalLibraryCount' => $totalLibraryCount,
    ]);
}

    // NEW: API endpoint to fetch libraries for browse page
// Replace the getBrowseLibraries method in LibraryController.php

public function getBrowseLibraries(Request $request)
{
    $isAuthenticated = auth()->check();
    $page = (int) $request->get('page', 1);
    $perPage = $isAuthenticated ? 50 : 18;

    // Use select to get only needed columns (reduces data transfer)
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
            'categories:id,name,slug,image',
            'industries:id,name,slug',
            'interactions:id,name,slug'
        ])
        ->where('libraries.is_active', true);

    // Apply category filter
    if ($request->has('category') && $request->category !== 'all') {
        $category = Category::where('slug', $request->category)->first(['id']);
        if ($category) {
            $query->whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            });
        }
    }

    // Apply industry filter
    if ($request->has('industry') && $request->industry !== 'all') {
        $industry = Industry::where('slug', $request->industry)->first(['id']);
        if ($industry) {
            $query->whereHas('industries', function($q) use ($industry) {
                $q->where('industries.id', $industry->id);
            });
        }
    }

    // Apply interaction filter
    if ($request->has('interaction') && $request->interaction !== 'all') {
        $interaction = Interaction::where('slug', $request->interaction)->first(['id']);
        if ($interaction) {
            $query->whereHas('interactions', function($q) use ($interaction) {
                $q->where('interactions.id', $interaction->id);
            });
        }
    }

    // Changed from latest() to inRandomOrder() for random ordering
    $libraries = $query->inRandomOrder()
        ->paginate($perPage);

    // Get all libraries for modal navigation (optimized - only essential fields)
    $allLibraries = Library::select(['id', 'slug', 'title'])
        ->where('is_active', true)
        ->inRandomOrder()
        ->get();

    return response()->json([
        'libraries' => $libraries->items(),
        'allLibraries' => $allLibraries,
        'pagination' => [
            'current_page' => $libraries->currentPage(),
            'last_page' => $libraries->lastPage(),
            'per_page' => $libraries->perPage(),
            'total' => $libraries->total(),
            'has_more' => $libraries->hasMorePages()
        ]
    ]);
}

    // Keep existing browse methods unchanged
    public function browseByCategory(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Get lightweight filters
        $filters = $this->getFilters();

        // Get total count only
        $totalLibraryCount = Library::where('is_active', true)
            ->whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            })
            ->count();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $categoryData = $category->toArray();
        if ($isAuthenticated) {
            $categoryData['is_following'] = $category->isFollowedBy(auth()->id());
        } else {
            $categoryData['is_following'] = false;
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Return minimal data for instant navigation
        return Inertia::render('Browse', [
            'libraries' => [], // Empty - will be loaded via API
            'filters' => $filters,
            'filterType' => 'category',
            'filterValue' => $category->slug,
            'filterName' => $category->name,
            'categoryData' => $categoryData,
            'selectedLibrary' => null,
            'allLibraries' => [], // Empty - will be loaded via API
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByIndustry(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $industry = Industry::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Get lightweight filters
        $filters = $this->getFilters();

        // Get total count only
        $totalLibraryCount = Library::where('is_active', true)
            ->whereHas('industries', function($q) use ($industry) {
                $q->where('industries.id', $industry->id);
            })
            ->count();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Return minimal data for instant navigation
        return Inertia::render('Browse', [
            'libraries' => [], // Empty - will be loaded via API
            'filters' => $filters,
            'filterType' => 'industry',
            'filterValue' => $industry->slug,
            'filterName' => $industry->name,
            'selectedLibrary' => null,
            'allLibraries' => [], // Empty - will be loaded via API
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByInteraction(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $interaction = Interaction::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Get lightweight filters
        $filters = $this->getFilters();

        // Get total count only
        $totalLibraryCount = Library::where('is_active', true)
            ->whereHas('interactions', function($q) use ($interaction) {
                $q->where('interactions.id', $interaction->id);
            })
            ->count();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Return minimal data for instant navigation
        return Inertia::render('Browse', [
            'libraries' => [], // Empty - will be loaded via API
            'filters' => $filters,
            'filterType' => 'interaction',
            'filterValue' => $interaction->slug,
            'filterName' => $interaction->name,
            'selectedLibrary' => null,
            'allLibraries' => [], // Empty - will be loaded via API
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function getLibrary(Request $request, $slug)
    {
        $library = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$library) {
            return response()->json(['error' => 'Library not found'], 404);
        }

        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        LibraryView::trackView($library->id, $userId, $sessionId);

        return response()->json([
            'library' => $library,
            'slug' => $slug,
            'seo_title' => $seo_title ?? null,
            'meta_description' => $meta_description ?? null,
            'focus_keyword' => $focus_keyword ?? null,
            'keywords' => $keywords ?? null,
            'canonical_url' => $canonical_url ?? null,
            'structured_data' => $structured_data ?? null,
            'og_title' => $og_title ?? null,
            'og_description' => $og_description ?? null,
            'og_image' => $og_image ?? null,
            'og_type' => $og_type ?? null
        ]);
    }

    public function filter(Request $request)
    {
        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);

        if ($request->has('platform') && $request->platform !== 'all') {
            $query->whereHas('platforms', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->platform . '%');
            });
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('slug', $request->category)
                  ->orWhere('name', 'like', '%' . $request->category . '%');
            });
        }

        if ($request->has('industry') && $request->industry !== 'all') {
            $query->whereHas('industries', function($q) use ($request) {
                $q->where('slug', $request->industry)
                  ->orWhere('name', 'like', '%' . $request->industry . '%');
            });
        }

        if ($request->has('interaction') && $request->interaction !== 'all') {
            $query->whereHas('interactions', function($q) use ($request) {
                $q->where('slug', $request->interaction)
                  ->orWhere('name', 'like', '%' . $request->interaction . '%');
            });
        }

        // Changed from latest() to inRandomOrder()
        $libraries = $query->inRandomOrder()->get();

        $userLibraryIds = [];
        if (auth()->check()) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return response()->json([
            'libraries' => $libraries,
            'total' => $libraries->count(),
            'userLibraryIds' => $userLibraryIds
        ]);
    }

    public function explore(Request $request)
    {
        return redirect()->route('home');
    }

    public function show(Request $request, $slug)
    {
        $library = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $isAuthenticated = auth()->check();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        LibraryView::trackView($library->id, $userId, $sessionId);

        // Get user's library IDs for authenticated users
        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        // Get all libraries for navigation - random order
        $allLibraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->inRandomOrder()
            ->get();

        $filters = $this->getFilters();

        $settings = Setting::getInstance();

        // Check if this is specifically a fetch API call (not an Inertia request)
        // Inertia requests will have the X-Inertia header
        $isInertiaRequest = $request->header('X-Inertia') !== null;
        $isFetchApiCall = !$isInertiaRequest && (
            $request->wantsJson() ||
            $request->header('X-Requested-With') === 'XMLHttpRequest'
        );

        // Only return JSON for fetch API calls, not Inertia requests
        if ($isFetchApiCall) {
            return response()->json([
                'library' => $library,
                'userLibraryIds' => $userLibraryIds,
                'userPlanLimits' => $userPlanLimits,
                'viewedLibraryIds' => $viewedLibraryIds,
            ]);
        }

        // For Inertia requests (including browser back button), render the Home page with modal open
        return Inertia::render('Home', [
            'libraries' => Library::with(['platforms', 'categories', 'industries', 'interactions'])
                ->where('is_active', true)
                ->inRandomOrder()
                ->take(18)
                ->get(),
            'filters' => $filters,
            'selectedLibrary' => $library,
            'allLibraries' => $allLibraries,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'isAuthenticated' => $isAuthenticated,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 18,
                'total' => 18,
                'has_more' => true
            ],
            'settings' => [
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/' . $settings->favicon) : null,
                'authentication_page_image' => $settings->authentication_page_image ? asset('storage/' . $settings->authentication_page_image) : null,
                'copyright_text' => $settings->copyright_text,
                'hero_image' => $settings->hero_image ? asset('storage/' . $settings->hero_image) : null,
            ],
            'topLibrariesByCategory' => [],
            'topLibrariesByInteraction' => [],
            'topLibrariesByIndustry' => [],
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
