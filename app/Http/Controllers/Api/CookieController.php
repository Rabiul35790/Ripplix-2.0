<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserCookie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CookieController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'accepted' => 'boolean',
            'user_id' => 'nullable|integer',
        ]);

        $cookieData = [
            'preferences' => $validated['preferences'],
            'accepted' => $validated['accepted'] ?? false,
            'timestamp' => now()->toIso8601String(),
        ];

        // Determine user ID: prioritize Auth, then request data
        $userId = Auth::id() ?? $validated['user_id'] ?? null;

        try {
            UserCookie::create([
                'user_id' => $userId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'cookie_data' => $cookieData,
                'session_id' => session()->getId(),
                'accepted_at' => $validated['accepted'] ? now() : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cookie preferences saved successfully',
                'user_authenticated' => !is_null($userId),
            ]);
        } catch (\Exception $e) {
            Log::error('Cookie storage failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save cookie preferences',
            ], 500);
        }
    }

    public function getUserPreferences(Request $request)
    {
        $query = UserCookie::where('ip_address', $request->ip());

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        }

        $cookie = $query->latest()->first();

        return response()->json([
            'preferences' => $cookie?->cookie_data ?? null,
            'user_authenticated' => Auth::check(),
        ]);
    }
}
