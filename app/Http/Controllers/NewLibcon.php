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
use Illuminate\Support\Facades\Log;

class LibraryController extends Controller
{
    const CACHE_TTL = 1800;
    const LIBRARIES_PER_PAGE = 12;

    /**
     * SAFE: Get user plan limits with optional caching
     */
    private function getUserPlanLimits(?User $user): ?array
    {
        if (!$user) {
            return null;
        }

        try {
            return Cache::remember("user_plan_limits_{$user->id}", 300, function() use ($user) {
                return $user->getPlanLimits();
            });
        } catch (\Exception $e) {
            return $user->getPlanLimits();
        }
    }

    /**
     * SAFE: Get current plan with optional caching
     */
    private function getCurrentPlan($user)
    {
        if (!$user) {
            return null;
        }

        try {
            return Cache::remember("user_current_plan_{$user->id}", 300, function() use ($user) {
                return $user->getCurrentPlan();
            });
        } catch (\Exception $e) {
            return $user->getCurrentPlan();
        }
    }

    /**
     * SAFE: Get viewed library IDs
     */
    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }

    /**
     * OPTIMIZED & SAFE: Main index with selective caching
     */
    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = self::LIBRARIES_PER_PAGE;
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        $currentPlan = null;
        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

        $platformFilter = $request->get('platform', 'website');

        // Optimized query with proper indexes
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
                'platforms:id,name,slug',
                'categories:id,name,image,slug,product_url,is_top',
                'industries:id,name,slug,is_top',
                'interactions:id,name,slug,is_top'
            ])
            ->where('libraries.is_active', true);

        // Filter by platform slug
        if ($platformFilter && $platformFilter !== 'all' && $platformFilter !== 'smartwatch') {
            $query->whereHas('platforms', function($q) use ($platformFilter) {
                $q->where('platforms.slug', $platformFilter);
            });
        }

        $query->inRandomOrder();

        // Get total count (can be cached safely)
        $cacheKey = "libraries_total_count_{$platformFilter}";
        try {
            $total = Cache::remember($cacheKey, 600, function() use ($query) {
                return $query->count();
            });
        } catch (\Exception $e) {
            $total = $query->count();
        }

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

        // Cache filters safely (rarely change)
        try {
            $filters = Cache::remember('filters_data_v2', 3600, function() {
                return $this->getFilters();
            });
        } catch (\Exception $e) {
            $filters = $this->getFilters();
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        // Cache settings safely (rarely change)
        try {
            $settings = Cache::remember('settings_instance_v2', 3600, function() {
                return Setting::getInstance();
            });
        } catch (\Exception $e) {
            $settings = Setting::getInstance();
        }

        $allLibraries = [];
        if ($isAuthenticated) {
            $allLibraries = Library::select(['id', 'slug', 'title'])
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(100)
                ->get();
        }

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
                'currentPlan' => $currentPlan,
                'pagination' => $paginationData,
                'currentPlatformFilter' => $platformFilter,
                'topLibrariesByCategory' => [],
                'topLibrariesByInteraction' => [],
                'topLibrariesByIndustry' => [],
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

        return response()->json([
            'libraries' => $libraries,
            'pagination' => $paginationData,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
        ]);
    }

    /**
     * OPTIMIZED & SAFE: Top libraries with caching
     */
    public function getTopLibraries(Request $request)
    {
        try {
            return Cache::remember('top_libraries_data_v2', 1800, function() {
                return $this->buildTopLibrariesData();
            });
        } catch (\Exception $e) {
            return $this->buildTopLibrariesData();
        }
    }

    /**
     * Helper method to build top libraries data
     */
    private function buildTopLibrariesData()
    {
        $topLibrariesByCategory = [];
        $topLibrariesByInteraction = [];
        $topLibrariesByIndustry = [];

        // Get top categories
        $topCategories = Category::where('is_top', 1)
            ->where('is_active', 1)
            ->select('id', 'name', 'slug', 'image')
            ->get();

        foreach ($topCategories as $category) {
            $libraries = Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name,slug',
                    'categories:id,name,image,slug',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get();

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
                'libraries' => $libraries
            ];
        }

        // Get top interactions
        $topInteractions = Interaction::where('is_top', 1)
            ->where('is_active', 1)
            ->select('id', 'name', 'slug')
            ->get();

        foreach ($topInteractions as $interaction) {
            $libraries = Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name,slug',
                    'categories:id,name,image,slug',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get();

            $totalCount = Library::whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                })
                ->where('is_active', true)
                ->count();

            $topLibrariesByInteraction[] = [
                'name' => $interaction->name,
                'slug' => $interaction->slug,
                'total_count' => $totalCount,
                'libraries' => $libraries
            ];
        }

        // Get top industries
        $topIndustries = Industry::where('is_top', 1)
            ->where('is_active', 1)
            ->select('id', 'name', 'slug')
            ->get();

        foreach ($topIndustries as $industry) {
            $libraries = Library::select(['id', 'title', 'slug', 'url', 'video_url', 'logo'])
                ->with([
                    'platforms:id,name,slug',
                    'categories:id,name,image,slug',
                    'industries:id,name',
                    'interactions:id,name'
                ])
                ->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                })
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit(3)
                ->get();

            $totalCount = Library::whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                })
                ->where('is_active', true)
                ->count();

            $topLibrariesByIndustry[] = [
                'name' => $industry->name,
                'slug' => $industry->slug,
                'total_count' => $totalCount,
                'libraries' => $libraries
            ];
        }

        return response()->json([
            'topLibrariesByCategory' => $topLibrariesByCategory,
            'topLibrariesByInteraction' => $topLibrariesByInteraction,
            'topLibrariesByIndustry' => $topLibrariesByIndustry,
        ]);
    }

    /**
     * OPTIMIZED & SAFE: Load more libraries
     */
    public function loadMore(Request $request)
    {
        $user = auth()->user();
        $page = (int) $request->get('page', 1);
        $perPage = self::LIBRARIES_PER_PAGE;
        $isAuthenticated = auth()->check();
        $platformFilter = $request->get('platform', 'smartwatch');

        $userPlanLimits = null;
        $currentPlan = null;

        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

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
                'platforms:id,name,slug',
                'categories:id,name,image,slug,product_url',
                'industries:id,name,slug',
                'interactions:id,name,slug'
            ])
            ->where('libraries.is_active', true);

        // Filter by platform slug
        if ($platformFilter && $platformFilter !== 'all' && $platformFilter !== 'smartwatch') {
            $query->whereHas('platforms', function($q) use ($platformFilter) {
                $q->where('platforms.slug', $platformFilter);
            });
        }

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
            'currentPlan' => $currentPlan,
            'viewedLibraryIds' => $viewedLibraryIds,
        ]);
    }

    public function browse(Request $request)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        $currentPlan = null;

        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

        $filterType = null;
        $filterValue = null;
        $filterName = null;
        $categoryData = null;

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

        try {
            $filters = Cache::remember('filters_data_v2', 3600, function() {
                return $this->getFilters();
            });
        } catch (\Exception $e) {
            $filters = $this->getFilters();
        }

        $countQuery = Library::where('is_active', true);

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

        return Inertia::render('Browse', [
            'libraries' => [],
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'categoryData' => $categoryData,
            'selectedLibrary' => null,
            'allLibraries' => [],
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function getBrowseLibraries(Request $request)
    {
        $isAuthenticated = auth()->check();
        $page = (int) $request->get('page', 1);
        $perPage = $isAuthenticated ? 50 : 18;

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
                'platforms:id,name,slug',
                'categories:id,name,slug,image,product_url',
                'industries:id,name,slug',
                'interactions:id,name,slug'
            ])
            ->where('libraries.is_active', true);

        // Apply filters
        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first(['id']);
            if ($category) {
                $query->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                });
            }
        }

        if ($request->has('industry') && $request->industry !== 'all') {
            $industry = Industry::where('slug', $request->industry)->first(['id']);
            if ($industry) {
                $query->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                });
            }
        }

        if ($request->has('interaction') && $request->interaction !== 'all') {
            $interaction = Interaction::where('slug', $request->interaction)->first(['id']);
            if ($interaction) {
                $query->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                });
            }
        }

        // Clone the query before pagination
        $allLibrariesQuery = clone $query;

        $libraries = $query->inRandomOrder()->paginate($perPage);

        // OPTIMIZED: Return 500 libraries for smooth circular suggestions
        $allLibraries = $allLibrariesQuery
            ->inRandomOrder()
            ->limit(500)
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

    public function browseByCategory(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        $currentPlan = null;
        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $filters = $this->getFilters();

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

        return Inertia::render('Browse', [
            'libraries' => [],
            'filters' => $filters,
            'filterType' => 'category',
            'filterValue' => $category->slug,
            'filterName' => $category->name,
            'categoryData' => $categoryData,
            'selectedLibrary' => null,
            'allLibraries' => [],
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByIndustry(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        $currentPlan = null;
        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

        $industry = Industry::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $filters = $this->getFilters();

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

        return Inertia::render('Browse', [
            'libraries' => [],
            'filters' => $filters,
            'filterType' => 'industry',
            'filterValue' => $industry->slug,
            'filterName' => $industry->name,
            'selectedLibrary' => null,
            'allLibraries' => [],
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByInteraction(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        $currentPlan = null;
        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
            $currentPlan = $this->getCurrentPlan($user);
        }

        $interaction = Interaction::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $filters = $this->getFilters();

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

        return Inertia::render('Browse', [
            'libraries' => [],
            'filters' => $filters,
            'filterType' => 'interaction',
            'filterValue' => $interaction->slug,
            'filterName' => $interaction->name,
            'selectedLibrary' => null,
            'allLibraries' => [],
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $currentPlan,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function getLibrary(Request $request, $slug)
    {
        $library = Library::with(['platforms:id,name,slug', 'categories:id,name,slug,product_url', 'industries', 'interactions'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$library) {
            return response()->json(['error' => 'Library not found'], 404);
        }

        return response()->json([
            'library' => $library,
            'slug' => $slug,
        ]);
    }

    public function filter(Request $request)
    {
        $query = Library::with(['platforms:id,name,slug', 'categories:id,name,slug,product_url', 'industries', 'interactions'])
            ->where('is_active', true);

        // FIXED: Filter by platform slug
        if ($request->has('platform') && $request->platform !== 'all') {
            $query->whereHas('platforms', function($q) use ($request) {
                $q->where('slug', $request->platform)
                  ->orWhere('name', 'like', '%' . $request->platform . '%');
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

    public function show(Request $request, $slug)
    {
        $library = Library::with(['platforms:id,name,slug', 'categories:id,name,slug,product_url', 'industries', 'interactions'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $isAuthenticated = auth()->check();
        $user = auth()->user();

        $userPlanLimits = null;
        if ($isAuthenticated && $user) {
            $userPlanLimits = $this->getUserPlanLimits($user);
        }

        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        LibraryView::trackView($library->id, $userId, $sessionId);

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $allLibraries = Library::with(['platforms:id,name,slug', 'categories:id,name,slug,product_url', 'industries', 'interactions'])
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(100)
            ->get();

        try {
            $filters = Cache::remember('filters_data_v2', 3600, function() {
                return $this->getFilters();
            });
        } catch (\Exception $e) {
            $filters = $this->getFilters();
        }

        try {
            $settings = Cache::remember('settings_instance_v2', 3600, function() {
                return Setting::getInstance();
            });
        } catch (\Exception $e) {
            $settings = Setting::getInstance();
        }

        $isInertiaRequest = $request->header('X-Inertia') !== null;
        $isFetchApiCall = !$isInertiaRequest && (
            $request->wantsJson() ||
            $request->header('X-Requested-With') === 'XMLHttpRequest'
        );

        if ($isFetchApiCall) {
            return response()->json([
                'library' => $library,
                'userLibraryIds' => $userLibraryIds,
                'userPlanLimits' => $userPlanLimits,
                'viewedLibraryIds' => $viewedLibraryIds,
            ]);
        }

        return Inertia::render('Home', [
            'libraries' => Library::with(['platforms:id,name,slug', 'categories:id,name,slug,product_url', 'industries', 'interactions'])
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
            'platforms' => Platform::where('is_active', true)->select('id', 'name', 'slug')->get(),
            'categories' => Category::where('is_active', true)
                ->select('id', 'name', 'slug', 'is_top', 'image', 'product_url')
                ->orderBy('name')
                ->get(),
            'industries' => Industry::where('is_active', true)->select('id', 'name', 'slug')->orderBy('name')->get(),
            'interactions' => Interaction::where('is_active', true)->select('id', 'name', 'slug')->orderBy('name')->get(),
        ];
    }
}
