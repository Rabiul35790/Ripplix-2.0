<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting; // Changed from Settings to Setting

class ShareSettingsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $settings = Setting::first(); // Changed from Settings to Setting

        Inertia::share([
            'settings' => [
                'logo' => $settings && $settings->logo
                    ? asset('storage/' . $settings->logo)
                    : null,

            'favicon' => $settings && $settings->favicon
                    ? asset('storage/' . $settings->favicon)
                    : null,

                // 'copyright_text' => $settings && $settings->copyright_text
                //     ? $settings->copyright_text : null,
            ]
        ]);

        return $next($request);
    }
}
