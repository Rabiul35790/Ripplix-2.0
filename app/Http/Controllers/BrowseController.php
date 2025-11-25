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
use App\Models\CategoryVariant;
use App\Models\IndustryVariant;
use App\Models\InteractionVariant;
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

    // OPTIMIZED: allApps - instant navigation
public function allApps(Request $request)
    {
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get ALL categories (not just those in variants)
        $allCategories = Category::select(['id', 'name', 'slug', 'image', 'product_url'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image,
                    'product_url' => $category->product_url,
                ];
            });

        // Get category variants with their categories
        $categoryVariants = CategoryVariant::with([
            'categories' => function ($query) {
                $query->select(['categories.id', 'categories.name', 'categories.slug', 'categories.image', 'categories.product_url'])
                    ->where('categories.is_active', true)
                    ->orderBy('category_category_variant.order');
            }
        ])
        ->where('is_active', true)
        ->orderBy('order')
        ->get(['id', 'name', 'order'])
        ->map(function ($variant) {
            return [
                'id' => $variant->id,
                'name' => $variant->name,
                'categories' => $variant->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'image' => $category->image,
                        'product_url' => $category->product_url,
                    ];
                }),
            ];
        });

        // Get IDs of categories that are in variants
        $categoriesInVariants = $categoryVariants->flatMap(function ($variant) {
            return $variant['categories'];
        })->pluck('id')->toArray();

        // Get categories NOT in any variant
        $categoriesNotInVariants = $allCategories->filter(function ($category) use ($categoriesInVariants) {
            return !in_array($category['id'], $categoriesInVariants);
        })->values();

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
            'libraries' => [],
            'categoryVariants' => $categoryVariants,
            'categoriesNotInVariants' => $categoriesNotInVariants,
            'allCategories' => $allCategories,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'categoryData' => $categoryData,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $this->getCurrentPlan($user),
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
        $user = auth()->user();

        // Get user plan limits
        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        // Get ALL industries (not just those in variants)
        $allIndustries = Industry::select(['id', 'name', 'slug'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($industry) {
                return [
                    'id' => $industry->id,
                    'name' => $industry->name,
                    'slug' => $industry->slug,
                ];
            });

        // Get industry variants with their industries
        $industryVariants = IndustryVariant::with([
            'industries' => function ($query) {
                $query->select(['industries.id', 'industries.name', 'industries.slug'])
                    ->where('industries.is_active', true)
                    ->orderBy('industry_industry_variant.order');
            }
        ])
        ->where('is_active', true)
        ->orderBy('order')
        ->get(['id', 'name', 'order'])
        ->map(function ($variant) {
            return [
                'id' => $variant->id,
                'name' => $variant->name,
                'industries' => $variant->industries->map(function ($industry) {
                    return [
                        'id' => $industry->id,
                        'name' => $industry->name,
                        'slug' => $industry->slug,
                    ];
                }),
            ];
        });

        // Get IDs of industries that are in variants
        $industriesInVariants = $industryVariants->flatMap(function ($variant) {
            return $variant['industries'];
        })->pluck('id')->toArray();

        // Get industries NOT in any variant
        $industriesNotInVariants = $allIndustries->filter(function ($industry) use ($industriesInVariants) {
            return !in_array($industry['id'], $industriesInVariants);
        })->values();

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
            'industryVariants' => $industryVariants,
            'industriesNotInVariants' => $industriesNotInVariants,
            'allIndustries' => $allIndustries,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $this->getCurrentPlan($user),
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
    $user = auth()->user();

    // Get user plan limits
    $userPlanLimits = null;
    if ($isAuthenticated) {
        $userPlanLimits = $this->getUserPlanLimits(auth()->user());
    }

    // Get ALL interactions (not just those in variants)
    $allInteractions = Interaction::select(['id', 'name', 'slug'])
        ->where('is_active', true)
        ->orderBy('name')
        ->get()
        ->map(function ($interaction) {
            return [
                'id' => $interaction->id,
                'name' => $interaction->name,
                'slug' => $interaction->slug,
            ];
        });

    // Get interaction variants with their interactions
    $interactionVariants = InteractionVariant::with([
        'interactions' => function ($query) {
            $query->select(['interactions.id', 'interactions.name', 'interactions.slug'])
                ->where('interactions.is_active', true)
                ->orderBy('interaction_interaction_variant.order');
        }
    ])
    ->where('is_active', true)
    ->orderBy('order')
    ->get(['id', 'name', 'order'])
    ->map(function ($variant) {
        return [
            'id' => $variant->id,
            'name' => $variant->name,
            'interactions' => $variant->interactions->map(function ($interaction) {
                return [
                    'id' => $interaction->id,
                    'name' => $interaction->name,
                    'slug' => $interaction->slug,
                ];
            }),
        ];
    });

    // Get IDs of interactions that are in variants
    $interactionsInVariants = $interactionVariants->flatMap(function ($variant) {
        return $variant['interactions'];
    })->pluck('id')->toArray();

    // Get interactions NOT in any variant
    $interactionsNotInVariants = $allInteractions->filter(function ($interaction) use ($interactionsInVariants) {
        return !in_array($interaction['id'], $interactionsInVariants);
    })->values();

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
        'interactionVariants' => $interactionVariants,
        'interactionsNotInVariants' => $interactionsNotInVariants,
        'allInteractions' => $allInteractions,
        'filters' => $filters,
        'filterType' => $filterType,
        'filterValue' => $filterValue,
        'filterName' => $filterName,
        'userLibraryIds' => $userLibraryIds,
        'viewedLibraryIds' => $viewedLibraryIds,
        'userPlanLimits' => $userPlanLimits,
        'currentPlan' => $this->getCurrentPlan($user),
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
