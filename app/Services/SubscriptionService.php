<?php

namespace App\Services;

use App\Models\User;
use App\Models\PricingPlan;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Process successful payment and update user subscription
     */
    public function processSuccessfulPayment(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            // Mark payment as completed
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // Update user subscription
            $payment->user->upgradeSubscription($payment->pricingPlan);

            Log::info("Subscription updated for user {$payment->user_id} with plan {$payment->pricingPlan->slug}");
        });
    }

    /**
     * Handle subscription expiry for a single user
     */
    public function handleExpiredUser(User $user): bool
    {
        if (!$user->isSubscriptionExpired()) {
            return false;
        }

        try {
            DB::beginTransaction();

            $oldPlan = $user->pricingPlan;
            $user->downgradeToFreeMember();

            DB::commit();

            Log::info("Downgraded expired user {$user->id} from {$oldPlan->name} to Free Member");

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to downgrade expired user {$user->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle all expired subscriptions
     */
    public function handleAllExpiredSubscriptions(): array
    {
        $expiredUsers = User::expiredSubscriptions()->get();
        $results = [
            'total' => $expiredUsers->count(),
            'downgraded' => 0,
            'failed' => 0,
        ];

        foreach ($expiredUsers as $user) {
            if ($this->handleExpiredUser($user)) {
                $results['downgraded']++;
            } else {
                $results['failed']++;
            }
        }

        Log::info("Subscription expiry batch process completed", $results);

        return $results;
    }

    /**
     * Get subscription analytics
     */
    public function getSubscriptionAnalytics(): array
    {
        $analytics = [
            'total_active_subscriptions' => 0,
            'expiring_soon' => 0,
            'expired_pending_downgrade' => 0,
            'lifetime_subscribers' => 0,
            'monthly_subscribers' => 0,
            'yearly_subscribers' => 0,
            'free_members' => 0,
            'revenue_data' => [],
        ];

        // Get subscription counts by plan type
        $lifetimePlans = PricingPlan::where('billing_period', 'lifetime')->pluck('id');
        $monthlyPlans = PricingPlan::where('billing_period', 'monthly')->pluck('id');
        $yearlyPlans = PricingPlan::where('billing_period', 'yearly')->pluck('id');
        $freePlans = PricingPlan::where('price', 0)->pluck('id');

        $analytics['lifetime_subscribers'] = User::active()
            ->whereIn('pricing_plan_id', $lifetimePlans)
            ->count();

        $analytics['monthly_subscribers'] = User::active()
            ->whereIn('pricing_plan_id', $monthlyPlans)
            ->whereNull('plan_expires_at')
            ->orWhere('plan_expires_at', '>', now())
            ->count();

        $analytics['yearly_subscribers'] = User::active()
            ->whereIn('pricing_plan_id', $yearlyPlans)
            ->whereNull('plan_expires_at')
            ->orWhere('plan_expires_at', '>', now())
            ->count();

        $analytics['free_members'] = User::active()
            ->whereIn('pricing_plan_id', $freePlans)
            ->count();

        $analytics['total_active_subscriptions'] =
            $analytics['lifetime_subscribers'] +
            $analytics['monthly_subscribers'] +
            $analytics['yearly_subscribers'];

        // Get users expiring soon (within 7 days)
        $analytics['expiring_soon'] = User::active()
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '>', now())
            ->where('plan_expires_at', '<=', now()->addDays(7))
            ->count();

        // Get expired users pending downgrade
        $analytics['expired_pending_downgrade'] = User::expiredSubscriptions()->count();

        return $analytics;
    }

    /**
     * Calculate monthly recurring revenue (MRR)
     */
    public function calculateMRR(): float
    {
        $mrr = 0;

        // Monthly subscribers
        $monthlySubscribers = User::active()
            ->whereHas('pricingPlan', function ($query) {
                $query->where('billing_period', 'monthly');
            })
            ->where(function ($query) {
                $query->whereNull('plan_expires_at')
                      ->orWhere('plan_expires_at', '>', now());
            })
            ->with('pricingPlan')
            ->get();

        foreach ($monthlySubscribers as $user) {
            $mrr += $user->pricingPlan->price;
        }

        // Yearly subscribers (convert to monthly)
        $yearlySubscribers = User::active()
            ->whereHas('pricingPlan', function ($query) {
                $query->where('billing_period', 'yearly');
            })
            ->where(function ($query) {
                $query->whereNull('plan_expires_at')
                      ->orWhere('plan_expires_at', '>', now());
            })
            ->with('pricingPlan')
            ->get();

        foreach ($yearlySubscribers as $user) {
            $mrr += $user->pricingPlan->price / 12;
        }

        return round($mrr, 2);
    }

    /**
     * Get users whose subscriptions are expiring soon
     */
    public function getUsersExpiringSoon(int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return User::active()
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '>', now())
            ->where('plan_expires_at', '<=', now()->addDays($days))
            ->with(['pricingPlan'])
            ->get();
    }

    /**
     * Send expiry notifications (to be implemented with your notification system)
     */
    public function sendExpiryNotifications(): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
        ];

        $expiringSoon = $this->getUsersExpiringSoon(7);

        foreach ($expiringSoon as $user) {
            try {
                // Implement your notification logic here
                // Example: Mail::to($user)->send(new SubscriptionExpiryNotification($user));

                Log::info("Expiry notification sent to user {$user->id}");
                $results['sent']++;
            } catch (\Exception $e) {
                Log::error("Failed to send expiry notification to user {$user->id}: " . $e->getMessage());
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Extend subscription for existing subscribers
     */
    public function extendSubscription(User $user, PricingPlan $plan): void
    {
        DB::transaction(function () use ($user, $plan) {
            $user->upgradeSubscription($plan);

            Log::info("Extended subscription for user {$user->id} with plan {$plan->slug}");
        });
    }

    /**
     * Cancel subscription (mark for non-renewal)
     */
    public function cancelSubscription(User $user): void
    {
        DB::transaction(function () use ($user) {
            // You might want to add a 'cancelled_at' field to track this
            // For now, we'll just log the cancellation

            Log::info("Subscription cancelled for user {$user->id}. Will expire at: {$user->plan_expires_at}");
        });
    }
}
