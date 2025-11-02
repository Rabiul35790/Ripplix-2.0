<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AutoHandleExpiredSubscriptions
{
    /**
     * Handle an incoming request and auto-check subscription expiry
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Only check for authenticated users
        if ($request->user()) {
            try {
                // Auto-check and handle expired subscriptions
                $user = $request->user();

                // Check if subscription is expired
                if ($user->isSubscriptionExpired()) {
                    $oldPlan = $user->pricingPlan;

                    // Auto-downgrade to free member plan (Plan ID 2)
                    $user->downgradeToFreeMember();

                    Log::info("Auto-downgraded expired user {$user->id} from {$oldPlan->name} to Free Member via middleware");

                    // Add flash message for user notification
                    if ($request->expectsJson()) {
                        // For API requests, add header
                        $response = $next($request);
                        return $response->header('X-Subscription-Expired', 'true');
                    } else {
                        // For web requests, add flash message
                        session()->flash('subscription_expired', 'Your subscription has expired and you have been moved to the Free Member plan.');
                    }
                }
            } catch (\Exception $e) {
                // Don't break the request if subscription check fails
                Log::error("Subscription middleware error for user {$request->user()->id}: " . $e->getMessage());
            }
        }

        return $next($request);
    }
}
