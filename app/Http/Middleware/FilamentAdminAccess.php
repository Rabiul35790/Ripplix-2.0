<?php
// app/Http/Middleware/FilamentAdminAccess.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Permission\Models\Role;

class FilamentAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }

        // Get all role names from the roles table
        $allRoles = Role::pluck('name')->toArray();

        // Check if the user has at least one of the existing roles
        if (!$user->hasAnyRole($allRoles)) {
            return redirect('/dashboard')->with('error', 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}
