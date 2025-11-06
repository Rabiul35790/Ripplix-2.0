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
            ->select('id', 'title', 'image', 'video', 'media_type', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'media_type' => $ad->media_type,
                    'image_url' => $ad->image_url,
                    'video_url' => $ad->video_url,
                    'media_url' => $ad->media_url,
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
            ->select('id', 'title', 'image', 'video', 'media_type', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'media_type' => $ad->media_type,
                    'image_url' => $ad->image_url,
                    'video_url' => $ad->video_url,
                    'media_url' => $ad->media_url,
                    'target_url' => $ad->target_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }

    /**
     * Get active home ads
     */
    public function getHomeAds(): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'home')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'video', 'media_type', 'target_url')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'media_type' => $ad->media_type,
                    'image_url' => $ad->image_url,
                    'video_url' => $ad->video_url,
                    'media_url' => $ad->media_url,
                    'target_url' => $ad->target_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }

    /**
     * Get active in-feed ads by link identifier
     */
    public function getInFeedAds(Request $request, string $linkIdentifier): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'in-feed')
            ->where('in_feed_link', $linkIdentifier)
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'video', 'media_type', 'target_url', 'in_feed_name', 'in_feed_link')
            ->inRandomOrder()
            ->limit(1)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'media_type' => $ad->media_type,
                    'image_url' => $ad->image_url,
                    'video_url' => $ad->video_url,
                    'media_url' => $ad->media_url,
                    'target_url' => $ad->target_url,
                    'in_feed_name' => $ad->in_feed_name,
                    'in_feed_link' => $ad->in_feed_link,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads->first(), // Return single ad or null
        ]);
    }

    /**
     * Get all available in-feed ad placements (for developers)
     */
    public function getInFeedPlacements(): JsonResponse
    {
        $placements = Ad::where('position', 'in-feed')
            ->active()
            ->select('in_feed_name', 'in_feed_link')
            ->distinct()
            ->get()
            ->map(function ($ad) {
                return [
                    'name' => $ad->in_feed_name,
                    'link' => $ad->in_feed_link,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $placements,
        ]);
    }

    /**
     * Get all active in-feed ads
     */
    public function getAllInFeedAds(): JsonResponse
    {
        $currentDate = now()->format('Y-m-d');

        $ads = Ad::where('status', 'active')
            ->where('position', 'in-feed')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->select('id', 'title', 'image', 'video', 'media_type', 'target_url', 'in_feed_name', 'in_feed_link')
            ->inRandomOrder()
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'media_type' => $ad->media_type,
                    'image_url' => $ad->image_url,
                    'video_url' => $ad->video_url,
                    'media_url' => $ad->media_url,
                    'target_url' => $ad->target_url,
                    'in_feed_name' => $ad->in_feed_name,
                    'in_feed_link' => $ad->in_feed_link,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ads,
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
            'in_feed_ads' => Ad::inFeed()->active()->count(),
            'image_ads' => Ad::where('media_type', 'image')->active()->count(),
            'video_ads' => Ad::where('media_type', 'video')->active()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
