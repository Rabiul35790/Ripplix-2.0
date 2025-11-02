<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        // Only check verification if user is authenticated
        if ($request->user() && !$request->user()->hasVerifiedEmail()) {
            return redirect()->route('verification.code.show')
                ->with('message', 'Please verify your email address to continue.');
        }

        return $next($request);
    }
}
