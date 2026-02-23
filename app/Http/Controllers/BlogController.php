<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class BlogController extends Controller
{
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(['id', 'name', 'slug']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'image']),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }

    private function getUserPlanLimits($user)
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

        try {
            return Cache::remember("user_current_plan_{$user->id}", 300, function() use ($user) {
                return $user->getCurrentPlan();
            });
        } catch (\Exception $e) {
            // Fallback without cache if error
            return $user->getCurrentPlan();
        }
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get active blog categories
        $categories = BlogCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('BlogIndex', [
            'categories' => $categories,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }

    public function show(Request $request, $slug)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the blog post with author details and social links
        $blog = Blog::with('category:id,name,slug')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Increment view count
        $blog->incrementViews();

        // Prepare blog data with formatted social links
        $blogData = $blog->toArray();
        $blogData['formatted_social_links'] = $blog->formatted_social_links;
        $blogData['has_social_links'] = $blog->hasSocialLinks();

        // Get related blogs (same category, excluding current blog, limit 3)
        $relatedBlogs = Blog::with('category:id,name,slug')
            ->where('is_published', true)
            ->where('id', '!=', $blog->id)
            ->when($blog->blog_category_id, function ($query) use ($blog) {
                $query->where('blog_category_id', $blog->blog_category_id);
            })
            ->latest('published_date')
            ->take(3)
            ->get();

        return Inertia::render('BlogShow', [
            'blog' => $blogData,
            'relatedBlogs' => $relatedBlogs,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }

    // API endpoint for fetching blogs with filters
    public function getBlogs(Request $request)
    {
        $query = Blog::with('category:id,name,slug')
            ->where('is_published', true);

        // Apply category filter
        if ($request->has('category') && $request->category !== 'all') {
            $category = BlogCategory::where('slug', $request->category)->first();
            if ($category) {
                $query->where('blog_category_id', $category->id);
            }
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Apply sort order
        $sortOrder = $request->get('sort', 'latest');
        if ($sortOrder === 'oldest') {
            $query->oldest('published_date');
        } else {
            $query->latest('published_date');
        }

        // Paginate results (12 per page)
        $blogs = $query->paginate(12);

        return response()->json($blogs);
    }

    // API endpoint for incrementing view count
    public function incrementView($slug)
    {
        $blog = Blog::where('slug', $slug)->firstOrFail();
        $blog->incrementViews();

        return response()->json(['success' => true]);
    }
}
