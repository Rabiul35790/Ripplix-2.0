<?php

namespace App\Providers;

use App\Models\Setting;
use App\Services\BackupService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
         $this->app->singleton(BackupService::class, function ($app) {
            return new BackupService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Setting::updated(function () {
        \App\Helpers\SettingsHelper::clearCache();
        });



        Inertia::share([
            'settings' => function () {
                $settings = Setting::first(); // Changed from Settings to Setting
                return [
                    'logo' => $settings && $settings->logo
                        ? asset('storage/' . $settings->logo)
                        : null,
                    'copyright_text' => $settings && $settings->copyright_text
                        ? $settings->copyright_text : null,
                ];
            }
        ]);
    }
}
