<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheStaticAssets
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $response;
        }

        $path = $request->path();

        // Cache images for 1 year
        if (preg_match('/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i', $path)) {
            return $response->header('Cache-Control', 'public, max-age=31536000, immutable')
                           ->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        }

        // Cache videos for 1 year
        if (preg_match('/\.(webm|mp4|ogg)$/i', $path)) {
            return $response->header('Cache-Control', 'public, max-age=31536000, immutable')
                           ->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT')
                           ->header('Accept-Ranges', 'bytes'); // Enable partial content for videos
        }

        // Cache fonts for 1 year
        if (preg_match('/\.(woff|woff2|ttf|eot|otf)$/i', $path)) {
            return $response->header('Cache-Control', 'public, max-age=31536000, immutable')
                           ->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        }

        // Cache CSS and JS for 1 year (assuming you use versioning/hashing)
        if (preg_match('/\.(css|js)$/i', $path)) {
            return $response->header('Cache-Control', 'public, max-age=31536000, immutable')
                           ->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        }

        return $response;
    }
}
