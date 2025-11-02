<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SeoMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add SEO headers
        $response->headers->set('X-Robots-Tag', 'index,follow');

        // Add cache headers for better performance
        if ($request->isMethod('GET') && !$request->is('admin/*')) {
            $response->headers->set('Cache-Control', 'public, max-age=3600');
            $response->headers->set('Vary', 'Accept-Encoding');
        }

        // Add security headers that also help with SEO
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
