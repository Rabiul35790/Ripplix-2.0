<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PricingController extends Controller
{
    /**
     * Get active pricing plans - ALWAYS FRESH DATA
     */
    public function getPlans(Request $request)
    {
        try {
            // Force fresh data from database every time
            $plans = PricingPlan::active()
                ->ordered()
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'slug' => $plan->slug,
                        'price' => (float) $plan->price,
                        'billing_period' => $plan->billing_period,
                        'original_price' => $plan->original_price ? (float) $plan->original_price : null,
                        'currency' => $plan->currency,
                        'description' => $plan->description,
                        'grid_list_visibility' => $plan->grid_list_visibility,
                        'daily_previews' => $plan->daily_previews,
                        'boards_create' => $plan->boards_create,
                        'board_sharing' => $plan->board_sharing,
                        'ads' => $plan->ads,
                        'extras' => $plan->extras,
                        'features' => $plan->features,
                        'is_active' => $plan->is_active,
                        'is_featured' => $plan->is_featured,
                        'student_discount_percentage' => $plan->student_discount_percentage,
                        'button_text' => $plan->button_text,
                        'button_color' => $plan->button_color,
                        'highlight_color' => $plan->highlight_color,
                        'formatted_price' => $plan->formatted_price,
                        'formatted_student_price' => $plan->formatted_student_price,
                        'sort_order' => $plan->sort_order,
                        'updated_at' => $plan->updated_at->toISOString(),
                        'fetched_at' => now()->toISOString(),
                    ];
                });

            return response()->json($plans)
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate, private')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0')
                ->header('X-Fresh-Data', 'true')
                ->header('X-Timestamp', now()->toISOString());

        } catch (\Exception $e) {
            Log::error('Failed to fetch pricing plans: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch pricing plans'], 500);
        }
    }



    public function startFreeTrial(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if (!$user->canTakeTrial()) {
            return response()->json(['error' => 'You are not eligible for the free trial'], 400);
        }

        try {
            $user->startFreeTrial();

            return response()->json([
                'message' => 'Free trial started successfully!',
                'trial_expires_at' => $user->plan_expires_at->toDateString(),
                'days_remaining' => 7,
            ]);

        } catch (\Exception $e) {
            Log::error('Free trial start failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start free trial'], 500);
        }
    }

    /**
     * Get user's current plan - ALWAYS FRESH
     */
    public function getCurrentPlan(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->pricing_plan_id) {
            return response()->json(null);
        }

        // Auto-check for expired subscription
        $user->checkAndHandleExpiredSubscription();

        // Refresh user model to get latest data
        $user->refresh();
        $plan = PricingPlan::find($user->pricing_plan_id);

        if (!$plan) {
            return response()->json(null);
        }

        $planData = [
            'id' => $plan->id,
            'name' => $plan->name,
            'slug' => $plan->slug,
            'price' => (float) $plan->price,
            'billing_period' => $plan->billing_period,
            'original_price' => $plan->original_price ? (float) $plan->original_price : null,
            'currency' => $plan->currency,
            'description' => $plan->description,
            'expires_at' => $user->plan_expires_at?->toDateString(),
            'days_until_expiry' => $user->daysUntilExpiry(),
            'is_on_trial' => $user->isOnTrial(), // Add trial status
            'can_take_trial' => $user->canTakeTrial(), // Add trial eligibility
            'fetched_at' => now()->toISOString(),
        ];

        return response()->json($planData)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate, private')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Update user's plan (for free plans only)
     */
    public function updateUserPlan(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:pricing_plans,id'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $plan = PricingPlan::findOrFail($request->plan_id);

        if (!$plan->is_active) {
            return response()->json(['error' => 'This plan is not available.'], 400);
        }

        if ($plan->price > 0) {
            return response()->json(['error' => 'Paid plans require payment processing.'], 400);
        }

        try {
            DB::beginTransaction();

            // Direct database update for free plans
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'pricing_plan_id' => $plan->id,
                    'plan_updated_at' => now(),
                    'plan_expires_at' => null,
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info("User {$user->id} updated to free plan: {$plan->slug}");

            return response()->json([
                'message' => 'Plan updated successfully',
                'plan' => $plan
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Plan update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Plan update failed'], 500);
        }
    }

    /**
     * Get subscription status - ALWAYS FRESH with auto-expiry check
     */
    public function getSubscriptionStatus(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['authenticated' => false]);
        }

        // Auto-check and handle expired subscriptions
        $user->checkAndHandleExpiredSubscription();
        $user->refresh();

        $currentPlan = null;
        if ($user->pricing_plan_id) {
            $plan = PricingPlan::find($user->pricing_plan_id);
            if ($plan) {
                $currentPlan = [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => (float) $plan->price,
                    'billing_period' => $plan->billing_period,
                    'expires_at' => $user->plan_expires_at?->toDateString(),
                    'days_until_expiry' => $user->daysUntilExpiry(),
                    'is_expired' => $user->isSubscriptionExpired(),
                    'expires_soon' => $user->subscriptionExpiresSoon(),
                ];
            }
        }

        $data = [
            'authenticated' => true,
            'current_plan' => $currentPlan,
            'subscription_status' => [
                'is_expired' => $user->isSubscriptionExpired(),
                'expires_soon' => $user->subscriptionExpiresSoon(),
                'days_until_expiry' => $user->daysUntilExpiry(),
            ],
            'fetched_at' => now()->toISOString(),
        ];

        return response()->json($data)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate, private')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
