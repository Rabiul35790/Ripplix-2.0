<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdController extends Controller
{
    /**
     * Get active sidebar ads
     */
    public function getSidebarAds(): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'sidebar')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'image_url' => $ad->image_url,
                    'target_url' => $ad->target_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }

    /**
     * Get active modal ads
     */
    public function getModalAds(): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'modal')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'image_url' => $ad->image_url,
                    'target_url' => $ad->target_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }


    public function getHomeAds(): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'home')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'image_url' => $ad->image_url,
                    'target_url' => $ad->target_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }

    /**
     * Track ad click
     */
    public function trackClick(Request $request, Ad $ad): JsonResponse
    {
        try {
            // Verify the ad is currently active
            if (!$ad->isCurrentlyActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Advertisement is not currently active',
                ], 400);
            }

            // Increment click count
            $ad->incrementClicks();

            return response()->json([
                'success' => true,
                'message' => 'Click tracked successfully',
                'clicks' => $ad->fresh()->clicks,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track click',
            ], 500);
        }
    }

    /**
     * Get ad statistics (for admin use)
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'total_ads' => Ad::count(),
            'active_ads' => Ad::active()->count(),
            'inactive_ads' => Ad::where('status', 'inactive')->count(),
            'total_clicks' => Ad::sum('clicks'),
            'sidebar_ads' => Ad::sidebar()->active()->count(),
            'modal_ads' => Ad::modal()->active()->count(),
            'home_ads' => Ad::home()->active()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
