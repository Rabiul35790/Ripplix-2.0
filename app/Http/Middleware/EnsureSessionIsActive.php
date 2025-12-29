<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class EnsureSessionIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure session is started and saved before proceeding
        if (!$request->hasSession()) {
            Log::warning('Request without session detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method()
            ]);
        }

        // Start session if not already started
        if ($request->hasSession() && !$request->session()->isStarted()) {
            $request->session()->start();
        }

        $response = $next($request);

        // Force session save for critical auth routes
        if ($request->is('register') || $request->is('verify-email') || $request->is('login')) {
            if ($request->hasSession()) {
                $request->session()->save();
            }
        }

        return $response;
    }
}