<?php
// app/Http/Middleware/TrackVisitors.php

namespace App\Http\Middleware;

use App\Models\VisitorSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Only track GET requests to main routes (not API, admin, etc.)
        if ($request->isMethod('GET') &&
            !$request->is('admin/*') &&
            !$request->is('api/*') &&
            !$request->is('_*') &&
            !auth()->check()) { // Don't track authenticated users as visitors

            try {
                VisitorSession::trackVisitor();
            } catch (\Exception $e) {
                // Silently fail to not break the application
                \Log::warning('Failed to track visitor: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
