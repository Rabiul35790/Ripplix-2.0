<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\Library;

class CacheOptimizationService
{
    const CACHE_TTL = 3600; // 1 hour
    const MEMORY_LIMIT_MB = 256; // Memory limit in MB
    const MAX_CACHE_SIZE_MB = 50; // Maximum cache size in MB

    /**
     * Warm up the cache with essential data
     */
    public static function warmUpCache(): void
    {
        // Check memory usage before warming up
        if (self::getMemoryUsageMB() > self::MEMORY_LIMIT_MB * 0.8) {
            self::clearOldCache();
        }

        // Warm up filters cache
        self::warmUpFilters();

        // Warm up first few pages of libraries
        self::warmUpLibrariesPages(3); // First 3 pages

        // Warm up popular libraries
        self::warmUpPopularLibraries();
    }

    /**
     * Warm up filters cache
     */
    private static function warmUpFilters(): void
    {
        Cache::remember('library_filters', self::CACHE_TTL * 2, function () {
            return [
                'platforms' => DB::table('platforms')
                    ->select('id', 'name', 'slug')
                    ->where('is_active', true)
                    ->get(),
                'categories' => DB::table('categories')
                    ->select('id', 'name', 'slug')
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(),
                'industries' => DB::table('industries')
                    ->select('id', 'name', 'slug')
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(),
                'interactions' => DB::table('interactions')
                    ->select('id', 'name', 'slug')
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(),
            ];
        });
    }

    /**
     * Warm up libraries pages cache
     */
    private static function warmUpLibrariesPages(int $maxPages = 3): void
    {
        $perPage = 20;

        for ($page = 1; $page <= $maxPages; $page++) {
            // Cache for authenticated users
            Cache::remember("home_libraries_auth_page_{$page}", self::CACHE_TTL, function () use ($page, $perPage) {
                return self::getLibrariesPage($page, $perPage);
            });

            // Cache for guests
            Cache::remember("home_libraries_guest_page_{$page}", self::CACHE_TTL, function () use ($page, $perPage) {
                return self::getLibrariesPage($page, $perPage);
            });
        }
    }

    /**
     * Warm up popular/recent libraries
     */
    private static function warmUpPopularLibraries(): void
    {
        // Cache most recent libraries
        Cache::remember('recent_libraries', self::CACHE_TTL, function () {
            return Library::with(['platforms:id,name', 'categories:id,name', 'industries:id,name', 'interactions:id,name'])
                ->select('id', 'title', 'slug', 'url', 'video_url', 'description', 'logo', 'created_at')
                ->where('is_active', true)
                ->latest()
                ->limit(50)
                ->get();
        });
    }

    /**
     * Get libraries page data
     */
    private static function getLibrariesPage(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;

        // Use raw query for better performance
        $libraries = DB::table('libraries')
            ->select('id', 'title', 'slug', 'url', 'video_url', 'description', 'logo', 'created_at')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        // Get total count
        $total = DB::table('libraries')->where('is_active', true)->count();

        // Load relationships separately for better memory usage
        foreach ($libraries as $library) {
            $library->platforms = DB::table('library_platform')
                ->join('platforms', 'platforms.id', '=', 'library_platform.platform_id')
                ->where('library_platform.library_id', $library->id)
                ->select('platforms.id', 'platforms.name')
                ->get();

            $library->categories = DB::table('library_category')
                ->join('categories', 'categories.id', '=', 'library_category.category_id')
                ->where('library_category.library_id', $library->id)
                ->select('categories.id', 'categories.name')
                ->get();

            $library->industries = DB::table('library_industry')
                ->join('industries', 'industries.id', '=', 'library_industry.industry_id')
                ->where('library_industry.library_id', $library->id)
                ->select('industries.id', 'industries.name')
                ->get();

            $library->interactions = DB::table('library_interaction')
                ->join('interactions', 'interactions.id', '=', 'library_interaction.interaction_id')
                ->where('library_interaction.library_id', $library->id)
                ->select('interactions.id', 'interactions.name')
                ->get();
        }

        return [
            'libraries' => $libraries,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'has_more' => $page < ceil($total / $perPage)
        ];
    }

    /**
     * Clear old cache entries
     */
    public static function clearOldCache(): void
    {
        // Clear home cache
        for ($page = 1; $page <= 50; $page++) {
            Cache::forget("home_libraries_auth_page_{$page}");
            Cache::forget("home_libraries_guest_page_{$page}");
        }

        // Clear other specific caches
        Cache::forget('library_filters');
        Cache::forget('recent_libraries');

        // Clear user-specific caches (this is more aggressive)
        $pattern = 'user_library_ids_*';
        if (method_exists(Cache::getStore(), 'flush')) {
            // For Redis/Memcached
            Cache::getStore()->flush();
        }
    }

    /**
     * Get current memory usage in MB
     */
    private static function getMemoryUsageMB(): float
    {
        return memory_get_usage(true) / 1024 / 1024;
    }

    /**
     * Get cache size estimation
     */
    public static function getCacheSizeInfo(): array
    {
        $memoryUsage = self::getMemoryUsageMB();
        $memoryLimit = self::MEMORY_LIMIT_MB;

        return [
            'memory_usage_mb' => round($memoryUsage, 2),
            'memory_limit_mb' => $memoryLimit,
            'memory_percentage' => round(($memoryUsage / $memoryLimit) * 100, 2),
            'cache_healthy' => $memoryUsage < ($memoryLimit * 0.8),
        ];
    }

    /**
     * Optimize database queries for library loading
     */
    public static function optimizeQueries(): void
    {
        // Add indexes if they don't exist
        $indexes = [
            'libraries' => ['is_active', 'created_at'],
            'platforms' => ['is_active'],
            'categories' => ['is_active', 'name'],
            'industries' => ['is_active', 'name'],
            'interactions' => ['is_active', 'name'],
        ];

        foreach ($indexes as $table => $columns) {
            foreach ($columns as $column) {
                $indexName = "idx_{$table}_{$column}";
                DB::statement("CREATE INDEX IF NOT EXISTS {$indexName} ON {$table} ({$column})");
            }
        }

        // Composite indexes
        DB::statement("CREATE INDEX IF NOT EXISTS idx_libraries_active_created ON libraries (is_active, created_at DESC)");
    }

    /**
     * Schedule cache warming (call this in a scheduled job)
     */
    public static function scheduleWarmUp(): void
    {
        // Warm up cache every hour
        if (Cache::missing('cache_last_warmed') ||
            Cache::get('cache_last_warmed') < now()->subHour()) {

            self::warmUpCache();
            Cache::put('cache_last_warmed', now(), self::CACHE_TTL);
        }
    }
}
