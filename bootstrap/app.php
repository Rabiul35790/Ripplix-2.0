<?php

use App\Console\Commands\AutoBackupCommand;
use App\Console\Commands\GenerateSitemap;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Console\Scheduling\Schedule;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'seo' => \App\Http\Middleware\SeoMiddleware::class,
            'auto.expired.subscriptions' => \App\Http\Middleware\AutoHandleExpiredSubscriptions::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'api.admin.access' => \App\Http\Middleware\ApiAdminAccess::class,
            'cache.static' => \App\Http\Middleware\CacheStaticAssets::class,
            'ensure.session' => \App\Http\Middleware\EnsureSessionIsActive::class, // Add new middleware
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureSessionIsActive::class, // Add before other middleware
            \App\Http\Middleware\TrackVisitors::class,
            \App\Http\Middleware\SeoMiddleware::class,
            \App\Http\Middleware\AutoHandleExpiredSubscriptions::class,
            \App\Http\Middleware\TrackCookieConsent::class,
            \App\Http\Middleware\CacheStaticAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle database errors with better logging
        $exceptions->render(function (\Illuminate\Database\QueryException $e) {
            \Illuminate\Support\Facades\Log::error('Database Query Error', [
                'message' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'N/A',
                'bindings' => $e->getBindings() ?? [],
                'trace' => $e->getTraceAsString()
            ]);

            if (str_contains($e->getMessage(), 'pricing_plan_id')) {
                return response()->json(['error' => 'Subscription service temporarily unavailable'], 500);
            }

            // Return generic error for other DB issues
            if (request()->expectsJson()) {
                return response()->json(['error' => 'Database error occurred'], 500);
            }
        });

        // Handle session errors
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e) {
            \Illuminate\Support\Facades\Log::warning('Session token mismatch', [
                'url' => request()->fullUrl(),
                'user_id' => auth()->id()
            ]);

            return redirect()->route('login')->withErrors(['error' => 'Your session has expired. Please login again.']);
        });

        // Custom error page rendering for Inertia requests
        $exceptions->respond(function (Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            // Only handle web requests, not API requests
            if ($request->is('api/*')) {
                return $response;
            }

            $statusCode = $response->getStatusCode();

            // Use ErrorService to handle error pages
            $errorService = new \App\Services\ErrorService();

            if ($errorService->shouldShowErrorPage($statusCode)) {
                try {
                    $errorPageData = $errorService->getErrorPageData($statusCode);
                    $suggestedActions = $errorService->getSuggestedActions($statusCode);

                    return Inertia::render('Error', array_merge($errorPageData, [
                        'suggestedActions' => $suggestedActions,
                    ]))->toResponse($request)->setStatusCode($statusCode);

                } catch (\Throwable $e) {
                    // Fallback if there's an error getting the data
                    \Illuminate\Support\Facades\Log::error('Error in exception handler: ' . $e->getMessage());

                    return Inertia::render('Error', [
                        'status' => $statusCode,
                        'error' => [
                            'title' => 'Error',
                            'message' => 'An error occurred.',
                            'description' => 'Please try again later.',
                            'icon' => 'error',
                            'canRetry' => true,
                            'showCategories' => false,
                        ],
                        'libraries' => collect([]),
                        'categories' => collect([]),
                        'filters' => [
                            'platforms' => collect([]),
                            'categories' => collect([]),
                            'industries' => collect([]),
                            'interactions' => collect([]),
                        ],
                        'suggestedActions' => [
                            ['label' => 'Go Home', 'action' => 'home', 'primary' => true],
                        ],
                    ])->toResponse($request)->setStatusCode($statusCode);
                }
            }

            return $response;
        });
    })
    ->withCommands([
        \App\Console\Commands\CleanupVisitorSessions::class,
        GenerateSitemap::class,
        \App\Console\Commands\HandleExpiredSubscriptionsCommand::class,
        AutoBackupCommand::class,
    ])
    ->withSchedule(function (Schedule $schedule) {
        // Automatic backup every 7 days at 2 AM
        $schedule->command('backup:auto --type=full')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->timezone('Asia/Dhaka')
            ->onSuccess(function () {
               \Illuminate\Support\Facades\Log::info('Automatic weekly backup completed successfully');
            })
            ->onFailure(function () {
                \Illuminate\Support\Facades\Log::error('Automatic weekly backup failed');
            });

        // Cleanup old backups every month
        $schedule->command('backup:clean')
            ->monthly()
            ->at('03:00')
            ->timezone('Asia/Dhaka');

        // Monitor backup health daily
        $schedule->command('backup:monitor')
            ->daily()
            ->at('01:00')
            ->timezone('Asia/Dhaka');
    })
    ->create();
