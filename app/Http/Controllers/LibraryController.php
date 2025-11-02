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

class LibraryController extends Controller
{
    const CACHE_TTL = 1800; // 30 minutes
    const LIBRARIES_PER_PAGE = 15;


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

    // Build query with platform filter
    $query = Library::with(['platforms:id,name', 'categories:id,name,image,slug,is_top', 'industries:id,name,is_top', 'interactions:id,name,is_top'])
        ->select('id', 'title', 'published_date', 'slug', 'url', 'video_url', 'description', 'logo', 'created_at')
        ->where('is_active', true);

    // Apply platform filter if not 'all'
    if ($platformFilter !== 'all') {
        $query->whereHas('platforms', function($q) use ($platformFilter) {
            $q->where('name', 'like', '%' . $platformFilter . '%');
        });
    }

    $query->latest();

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

    // Get filters
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
        $allLibraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->latest()
            ->get();
    }

    // OPTIMIZED: Get top libraries grouped by categories, interactions, and industries
    // Only send 4 libraries per group with total count
    $topLibrariesByCategory = [];
    $topLibrariesByInteraction = [];
    $topLibrariesByIndustry = [];

    // Get libraries with top categories (limit to 4 per category)
    $topCategories = Category::where('is_top', 1)->get();
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
            'libraries' => Library::with(['platforms:id,name', 'categories:id,name', 'industries:id,name', 'interactions:id,name'])
                ->select('id', 'title', 'slug', 'url', 'video_url', 'logo')
                ->whereHas('categories', function($q) use ($category) {
                    $q->where('categories.id', $category->id);
                })
                ->where('is_active', true)
                ->latest()
                ->limit(3)
                ->get()
        ];
    }

    // Get libraries with top interactions (limit to 4 per interaction)
    $topInteractions = Interaction::where('is_top', 1)->get();
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
            'libraries' => Library::with(['platforms:id,name', 'categories:id,name', 'industries:id,name', 'interactions:id,name'])
                ->select('id', 'title', 'slug', 'url', 'video_url', 'logo')
                ->whereHas('interactions', function($q) use ($interaction) {
                    $q->where('interactions.id', $interaction->id);
                })
                ->where('is_active', true)
                ->latest()
                ->limit(3)
                ->get()
        ];
    }

    // Get libraries with top industries (limit to 4 per industry)
    $topIndustries = Industry::where('is_top', 1)->get();
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
            'libraries' => Library::with(['platforms:id,name', 'categories:id,name', 'industries:id,name', 'interactions:id,name'])
                ->select('id', 'title', 'slug', 'url', 'video_url', 'logo')
                ->whereHas('industries', function($q) use ($industry) {
                    $q->where('industries.id', $industry->id);
                })
                ->where('is_active', true)
                ->latest()
                ->limit(3)
                ->get()
        ];
    }

    // For initial page load, return full page
    if ($page === 1 && !$request->wantsJson()) {
        return Inertia::render('Home', [
            'libraries' => $libraries,
            'filters' => $filters,
            'selectedLibrary' => null,
            'allLibraries' => $allLibraries,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'pagination' => $paginationData,
            'currentPlatformFilter' => $platformFilter,
            'topLibrariesByCategory' => $topLibrariesByCategory,
            'topLibrariesByInteraction' => $topLibrariesByInteraction,
            'topLibrariesByIndustry' => $topLibrariesByIndustry,
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

    // Build query with platform filter
    $query = Library::with(['platforms:id,name', 'categories:id,name,image,slug', 'industries:id,name', 'interactions:id,name'])
        ->select('id', 'title', 'slug', 'url', 'video_url', 'description', 'logo', 'created_at')
        ->where('is_active', true);

    // Apply platform filter if not 'all'
    if ($platformFilter !== 'all') {
        $query->whereHas('platforms', function($q) use ($platformFilter) {
            $q->where('name', 'like', '%' . $platformFilter . '%');
        });
    }

    $query->latest();

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
        'userPlanLimits' => $userPlanLimits, // ADD THIS
        'viewedLibraryIds' => $viewedLibraryIds,

    ]);
}

public function browse(Request $request)
{
    $isAuthenticated = auth()->check();

    $userPlanLimits = null;
    if ($isAuthenticated) {
        $userPlanLimits = $this->getUserPlanLimits(auth()->user());
    }

    $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
        ->where('is_active', true);

    $filterType = null;
    $filterValue = null;
    $filterName = null;
    $categoryData = null;

    // Apply category filter
    if ($request->has('category') && $request->category !== 'all') {
        $category = Category::where('slug', $request->category)->first();
        if ($category) {
            $query->whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            });
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

    // Apply industry filter
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

    // Apply interaction filter
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

    // Apply platform filter if provided
    if ($request->has('platform') && $request->platform !== 'all') {
        $query->whereHas('platforms', function($q) use ($request) {
            $q->where('name', 'like', '%' . $request->platform . '%');
        });
    }

    $totalLibraryCount = $query->count();

    if (!$isAuthenticated) {
        $libraries = $query->latest()->take(18)->get();
    } else {
        $libraries = $query->latest()->get();
    }

    $filters = $this->getFilters();

    // Get all libraries for modal navigation
    $allLibraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
        ->where('is_active', true)
        ->latest()
        ->get();

    $userLibraryIds = [];
    if ($isAuthenticated) {
        $userLibraryIds = Board::getUserLibraryIds(auth()->id());
    }

    $viewedLibraryIds = $this->getViewedLibraryIds($request);

    return Inertia::render('Browse', [
        'libraries' => $libraries,
        'filters' => $filters,
        'filterType' => $filterType,
        'filterValue' => $filterValue,
        'filterName' => $filterName,
        'categoryData' => $categoryData,
        'selectedLibrary' => null,
        'allLibraries' => $allLibraries,
        'userLibraryIds' => $userLibraryIds,
        'viewedLibraryIds' => $viewedLibraryIds,
        'isAuthenticated' => $isAuthenticated,
        'userPlanLimits' => $userPlanLimits,
        'totalLibraryCount' => $totalLibraryCount,
    ]);
}

    // Keep existing browse methods unchanged
    public function browseByCategory(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->whereHas('categories', function($q) use ($category) {
                $q->where('categories.id', $category->id);
            });

        $totalLibraryCount = $query->count();

        if (!$isAuthenticated) {
            $libraries = $query->latest()->take(18)->get();
        } else {
            $libraries = $query->latest()->get();
        }

        $filters = $this->getFilters();

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
            'libraries' => $libraries,
            'filters' => $filters,
            'filterType' => 'category',
            'filterValue' => $category->slug,
            'filterName' => $category->name,
            'categoryData' => $categoryData,
            'selectedLibrary' => null,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByIndustry(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $industry = Industry::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->whereHas('industries', function($q) use ($industry) {
                $q->where('industries.id', $industry->id);
            });

        $totalLibraryCount = $query->count();

        if (!$isAuthenticated) {
            $libraries = $query->latest()->take(18)->get();
        } else {
            $libraries = $query->latest()->get();
        }

        $filters = $this->getFilters();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        return Inertia::render('Browse', [
            'libraries' => $libraries,
            'filters' => $filters,
            'filterType' => 'industry',
            'filterValue' => $industry->slug,
            'filterName' => $industry->name,
            'selectedLibrary' => null,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
            'totalLibraryCount' => $totalLibraryCount,
        ]);
    }

    public function browseByInteraction(Request $request, $slug)
    {
        $isAuthenticated = auth()->check();
        $interaction = Interaction::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->whereHas('interactions', function($q) use ($interaction) {
                $q->where('interactions.id', $interaction->id);
            });

        $totalLibraryCount = $query->count();

        if (!$isAuthenticated) {
            $libraries = $query->latest()->take(18)->get();
        } else {
            $libraries = $query->latest()->get();
        }

        $filters = $this->getFilters();

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        return Inertia::render('Browse', [
            'libraries' => $libraries,
            'filters' => $filters,
            'filterType' => 'interaction',
            'filterValue' => $interaction->slug,
            'filterName' => $interaction->name,
            'selectedLibrary' => null,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'isAuthenticated' => $isAuthenticated,
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

        $libraries = $query->latest()->get();

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

        // Get all libraries for navigation
        $allLibraries = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true)
            ->latest()
            ->get();

        $filters = $this->getFilters();

        // Check if this is an AJAX request (for modal)
        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'library' => $library,
                'userLibraryIds' => $userLibraryIds,
                'userPlanLimits' => $userPlanLimits,
                'viewedLibraryIds' => $viewedLibraryIds,
            ]);
        }

        // For direct access (e.g., shared links), render with modal open
        return Inertia::render('Home', [
            'libraries' => Library::with(['platforms', 'categories', 'industries', 'interactions'])
                ->where('is_active', true)
                ->latest()
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
