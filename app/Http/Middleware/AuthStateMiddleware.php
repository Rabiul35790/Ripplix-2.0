<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthStateMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // If this is an Inertia request and auth state has changed,
        // force a page reload to ensure proper state synchronization
        if ($request->header('X-Inertia') && $this->shouldForceReload($request)) {
            return Inertia::location($request->url());
        }

        return $response;
    }

    /**
     * Determine if we should force a page reload.
     */
    private function shouldForceReload(Request $request): bool
    {
        // Force reload after login/logout operations
        return $request->routeIs('login') ||
               $request->routeIs('logout') ||
               $request->routeIs('register') ||
               $request->routeIs('auth.google.callback');
    }
}
