<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule sitemap generation
Schedule::command('sitemap:generate')->daily()->at('02:00');

// Schedule SEO analysis for all libraries
Schedule::call(function () {
    \App\Models\Library::query()
        ->where('is_active', true)
        ->chunk(50, function ($libraries) {
            foreach ($libraries as $library) {
                $library->performSeoAnalysis();
            }
        });
})->daily()->at('03:00');




Schedule::command('subscriptions:handle-expired')
    ->daily()
    ->at('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Illuminate\Support\Facades\Log::info('Subscription expiry check completed successfully');
    })
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('Subscription expiry check failed');
    });

// Optional: Send expiry notifications (7 days before expiry)
Schedule::command('subscriptions:handle-expired --notify')
    ->daily()
    ->at('09:00')
    ->withoutOverlapping()
    ->runInBackground();

// Optional: More frequent checking during business hours
Schedule::command('subscriptions:handle-expired')
    ->hourly()
    ->between('8:00', '18:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->when(function () {
        // Only run if there are users with subscriptions expiring today
        return \App\Models\User::whereNotNull('plan_expires_at')
            ->whereDate('plan_expires_at', today())
            ->exists();
    });

// Clean up old payment records (optional - keeps database lean)
Schedule::call(function () {
    \App\Models\Payment::where('status', 'failed')
        ->where('created_at', '<', now()->subDays(30))
        ->delete();

    \App\Models\Payment::where('status', 'cancelled')
        ->where('created_at', '<', now()->subDays(7))
        ->delete();
})->daily()->at('03:00');
