<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Permission\Models\Role;

class ApiAdminAccess
{
    /**
     * Handle an incoming request for API endpoints
     * Authenticates using Sanctum token and checks for admin roles
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated via Sanctum
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please provide a valid API token.'
            ], 401);
        }

        $user = $request->user();

        // Get all role names from the roles table
        $allRoles = Role::pluck('name')->toArray();

        // Check if the user has at least one of the existing roles
        if (!$user->hasAnyRole($allRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You do not have permission to access this endpoint.'
            ], 403);
        }

        return $next($request);
    }
}
