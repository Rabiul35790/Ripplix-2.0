<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class PreloadUserData
{
    /**
     * Handle an incoming request.
     *
     * Preload user data with eager loading to reduce N+1 queries
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            // Eager load pricing plan relationship to prevent additional queries
            $user = Auth::user();

            // Load pricing plan if not already loaded
            if (!$user->relationLoaded('pricingPlan')) {
                $user->load('pricingPlan');
            }
        }

        return $next($request);
    }
}
