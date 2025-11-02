<?php

namespace App\Services;

use App\Models\Library;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class ErrorService
{
    /**
     * Get error data and layout data for error pages
     */
    public function getErrorPageData(int $statusCode): array
    {
        try {
            // Cache the layout data for better performance
            $cacheDuration = Config::get('errors.cache_duration', 300);
            $layoutData = Cache::remember('error_page_layout_data', $cacheDuration, function () {
                return [
                    'libraries' => Library::with(['platforms', 'categories', 'industries', 'interactions'])
                        ->where('is_active', true)
                        ->latest()
                        ->get(),
                    'categories' => Category::where('is_active', true)
                        ->orderBy('name')
                        ->get(),
                    'filters' => [
                        'platforms' => Platform::where('is_active', true)->get(),
                        'categories' => Category::where('is_active', true)->orderBy('name')->get(),
                        'industries' => Industry::where('is_active', true)->orderBy('name')->get(),
                        'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(),
                    ],
                ];
            });

            $errorData = $this->getErrorDetails($statusCode);

            return array_merge($layoutData, [
                'status' => $statusCode,
                'error' => $errorData,
            ]);

        } catch (\Throwable $e) {
            if (Config::get('errors.logging.log_error_page_data_failures', true)) {
                Log::log(
                    Config::get('errors.logging.log_level', 'error'),
                    'Error in ErrorService::getErrorPageData: ' . $e->getMessage(),
                    ['status_code' => $statusCode, 'exception' => $e]
                );
            }

            // Return minimal fallback data
            return [
                'status' => $statusCode,
                'error' => $this->getErrorDetails($statusCode),
                'libraries' => collect([]),
                'categories' => collect([]),
                'filters' => [
                    'platforms' => collect([]),
                    'categories' => collect([]),
                    'industries' => collect([]),
                    'interactions' => collect([]),
                ],
            ];
        }
    }

    /**
     * Get error details based on status code from config
     */
    private function getErrorDetails(int $statusCode): array
    {
        $errorConfigs = Config::get('errors.error_codes', []);
        $defaultConfig = Config::get('errors.default', []);

        $config = $errorConfigs[$statusCode] ?? $defaultConfig;

        return [
            'title' => $config['title'] ?? 'Error',
            'message' => $config['message'] ?? 'An error occurred.',
            'description' => $config['description'] ?? 'Something unexpected happened.',
            'icon' => $config['icon'] ?? 'error',
            'canRetry' => $config['can_retry'] ?? false,
            'showCategories' => $config['show_categories'] ?? false,
            'theme' => $config['theme'] ?? [
                'bg' => 'bg-gray-50 dark:bg-gray-800/50',
                'text' => 'text-gray-600 dark:text-gray-400',
                'button' => 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
            ],
        ];
    }

    /**
     * Check if status code should show error page
     */
    public function shouldShowErrorPage(int $statusCode): bool
    {
        $supportedCodes = Config::get('errors.supported_codes', [404, 403, 500, 503, 419, 429]);
        return in_array($statusCode, $supportedCodes);
    }

    /**
     * Get suggested actions based on error type from config
     */
    public function getSuggestedActions(int $statusCode): array
    {
        $errorConfigs = Config::get('errors.error_codes', []);
        $defaultConfig = Config::get('errors.default', []);

        $config = $errorConfigs[$statusCode] ?? $defaultConfig;

        return $config['actions'] ?? [
            ['label' => 'Go Home', 'action' => 'home', 'primary' => true],
        ];
    }

    /**
     * Get error theme configuration
     */
    public function getErrorTheme(int $statusCode): array
    {
        $errorData = $this->getErrorDetails($statusCode);
        return $errorData['theme'] ?? [
            'bg' => 'bg-gray-50 dark:bg-gray-800/50',
            'text' => 'text-gray-600 dark:text-gray-400',
            'button' => 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        ];
    }

    /**
     * Clear error page cache
     */
    public function clearCache(): void
    {
        Cache::forget('error_page_layout_data');
    }

    /**
     * Warm up error page cache
     */
    public function warmCache(): void
    {
        try {
            $this->getErrorPageData(404); // Warm cache with most common error
        } catch (\Throwable $e) {
            Log::warning('Failed to warm error page cache: ' . $e->getMessage());
        }
    }
}
