<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackCookieConsent
{
    public function handle(Request $request, Closure $next): Response
    {
        // Add IP and session info to share with frontend
        $request->merge([
            'visitor_ip' => $request->ip(),
            'session_id' => session()->getId(),
        ]);

        return $next($request);
    }
}
