<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class StripeWebhookController extends CashierController
{
    /**
     * Handle invoice payment succeeded.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleInvoicePaymentSucceeded(array $payload)
    {
        $invoice = $payload['data']['object'];

        Log::info('Invoice payment succeeded', [
            'invoice_id' => $invoice['id'],
            'customer' => $invoice['customer'],
        ]);

        // Let Cashier handle the base functionality
        $response = parent::handleInvoicePaymentSucceeded($payload);

        // Additional custom logic
        if (isset($invoice['customer'])) {
            $user = User::where('stripe_id', $invoice['customer'])->first();

            if ($user && isset($invoice['subscription'])) {
                // Update user's subscription plan if needed
                $this->updateUserSubscriptionPlan($user, $invoice['subscription']);
            }
        }

        return $response;
    }

    /**
     * Handle customer subscription created.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionCreated(array $payload)
    {
        $subscription = $payload['data']['object'];

        Log::info('Customer subscription created', [
            'subscription_id' => $subscription['id'],
            'customer' => $subscription['customer'],
        ]);

        $response = parent::handleCustomerSubscriptionCreated($payload);

        // Update user's subscription plan
        if (isset($subscription['customer'])) {
            $user = User::where('stripe_id', $subscription['customer'])->first();

            if ($user) {
                $this->updateUserSubscriptionPlan($user, $subscription['id']);
            }
        }

        return $response;
    }

    /**
     * Handle customer subscription updated.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionUpdated(array $payload)
    {
        $subscription = $payload['data']['object'];

        Log::info('Customer subscription updated', [
            'subscription_id' => $subscription['id'],
            'customer' => $subscription['customer'],
            'status' => $subscription['status'],
        ]);

        $response = parent::handleCustomerSubscriptionUpdated($payload);

        // Update user's subscription plan
        if (isset($subscription['customer'])) {
            $user = User::where('stripe_id', $subscription['customer'])->first();

            if ($user) {
                $this->updateUserSubscriptionPlan($user, $subscription['id']);
            }
        }

        return $response;
    }

    /**
     * Handle customer subscription deleted.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionDeleted(array $payload)
    {
        $subscription = $payload['data']['object'];

        Log::info('Customer subscription deleted', [
            'subscription_id' => $subscription['id'],
            'customer' => $subscription['customer'],
        ]);

        $response = parent::handleCustomerSubscriptionDeleted($payload);

        // Downgrade user to free plan
        if (isset($subscription['customer'])) {
            $user = User::where('stripe_id', $subscription['customer'])->first();

            if ($user && !$user->isOnLifetimePlan()) {
                $user->assignFreePlan();

                Log::info('User downgraded to free plan', [
                    'user_id' => $user->id,
                ]);
            }
        }

        return $response;
    }

    /**
     * Handle checkout session completed.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCheckoutSessionCompleted(array $payload)
    {
        $session = $payload['data']['object'];

        Log::info('Checkout session completed', [
            'session_id' => $session['id'],
            'customer' => $session['customer'] ?? null,
            'mode' => $session['mode'],
        ]);

        // Handle one-time payment (lifetime plan)
        if ($session['mode'] === 'payment' && isset($session['metadata']['plan_id'])) {
            $this->handleLifetimePurchase($session);
        }

        return $this->successMethod();
    }

    /**
     * Handle lifetime plan purchase
     */
    protected function handleLifetimePurchase(array $session)
    {
        $customerId = $session['customer'];
        $planId = $session['metadata']['plan_id'] ?? null;

        if (!$customerId || !$planId) {
            Log::warning('Missing customer or plan ID in lifetime purchase', [
                'session_id' => $session['id'],
            ]);
            return;
        }

        $user = User::where('stripe_id', $customerId)->first();
        $plan = SubscriptionPlan::find($planId);

        if (!$user || !$plan) {
            Log::warning('User or plan not found for lifetime purchase', [
                'customer_id' => $customerId,
                'plan_id' => $planId,
            ]);
            return;
        }

        // Cancel any active recurring subscriptions
        if ($user->hasActiveStripeSubscription()) {
            $user->subscription('default')->cancelNow();
        }

        // Assign lifetime plan
        $user->update([
            'subscription_plan_id' => $plan->id,
            'auto_renew' => false,
        ]);

        Log::info('Lifetime plan assigned', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
        ]);
    }

    /**
     * Update user's subscription plan based on Stripe subscription
     */
    protected function updateUserSubscriptionPlan(User $user, string $stripeSubscriptionId)
    {
        try {
            $stripe = new \Stripe\StripeClient(config('cashier.secret'));
            $stripeSubscription = $stripe->subscriptions->retrieve($stripeSubscriptionId);

            if (!isset($stripeSubscription->items->data[0]->price->id)) {
                Log::warning('No price ID found in subscription', [
                    'subscription_id' => $stripeSubscriptionId,
                ]);
                return;
            }

            $priceId = $stripeSubscription->items->data[0]->price->id;
            $plan = SubscriptionPlan::where('stripe_price_id', $priceId)->first();

            if ($plan) {
                $user->update([
                    'subscription_plan_id' => $plan->id,
                    'auto_renew' => !$stripeSubscription->cancel_at_period_end,
                ]);

                Log::info('User subscription plan updated', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'auto_renew' => !$stripeSubscription->cancel_at_period_end,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error updating user subscription plan', [
                'user_id' => $user->id,
                'subscription_id' => $stripeSubscriptionId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
