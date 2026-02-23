<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(['id', 'name', 'slug']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'image']),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }

    private function getUserPlanLimits($user)
    {
        if (!$user) {
            return null;
        }
        return $user->getPlanLimits();
    }

    private function getCurrentPlan($user)
    {
        if (!$user) {
            return null;
        }

        try {
            return Cache::remember("user_current_plan_{$user->id}", 300, function() use ($user) {
                return $user->getCurrentPlan();
            });
        } catch (\Exception $e) {
            // Fallback without cache if error
            return $user->getCurrentPlan();
        }
    }

    /**
     * Show payment management page
     */
    public function paymentManagement(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        return Inertia::render('PaymentManagement', [
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }

    /**
     * Get all available subscription plans
     */
    public function getPlans()
    {
        try {
            $plans = SubscriptionPlan::where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($plan) {
                    $features = $plan->features;
                    if (is_string($features)) {
                        $features = json_decode($features, true) ?? [];
                    }

                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'slug' => $plan->slug,
                        'description' => $plan->description,
                        'price' => (float) $plan->price,
                        'billing_period' => $plan->billing_period,
                        'features' => $features,
                        'is_active' => $plan->is_active,
                    ];
                });

            return response()->json([
                'success' => true,
                'plans' => $plans
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plans', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription plans',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get current user's subscription status
     */
    public function getCurrentSubscription(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $data = [
                'success' => true,
                'subscription_plan' => null,
                'has_active_subscription' => false,
                'auto_renew' => $user->auto_renew ?? false,
                'payment_method' => null,
            ];

            // Get subscription plan if exists
            try {
                if ($user->subscription_plan_id && $user->subscriptionPlan) {
                    $plan = $user->subscriptionPlan;

                    $features = $plan->features;
                    if (is_string($features)) {
                        $features = json_decode($features, true) ?? [];
                    }

                    $data['subscription_plan'] = [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'slug' => $plan->slug,
                        'description' => $plan->description,
                        'price' => (float) $plan->price,
                        'billing_period' => $plan->billing_period,
                        'features' => $features,
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Error loading subscription plan', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Check for active Stripe subscription
            try {
                if (method_exists($user, 'subscribed')) {
                    $data['has_active_subscription'] = $user->subscribed('default');
                }
            } catch (\Exception $e) {
                Log::error('Error checking Stripe subscription', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Get payment method details if exists
            try {
                if (method_exists($user, 'hasDefaultPaymentMethod') && $user->hasDefaultPaymentMethod()) {
                    $paymentMethod = $user->defaultPaymentMethod();
                    if ($paymentMethod && isset($paymentMethod->card)) {
                        $data['payment_method'] = [
                            'brand' => $paymentMethod->card->brand ?? 'unknown',
                            'last_four' => $paymentMethod->card->last4 ?? '****',
                            'exp_month' => $paymentMethod->card->exp_month ?? null,
                            'exp_year' => $paymentMethod->card->exp_year ?? null,
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error loading payment method', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Get active subscription details
            try {
                if ($data['has_active_subscription'] && method_exists($user, 'subscription')) {
                    $subscription = $user->subscription('default');
                    if ($subscription) {
                        $data['stripe_subscription'] = [
                            'status' => $subscription->stripe_status ?? 'unknown',
                            'ends_at' => $subscription->ends_at,
                            'trial_ends_at' => $subscription->trial_ends_at ?? null,
                            'on_grace_period' => method_exists($subscription, 'onGracePeriod') ? $subscription->onGracePeriod() : false,
                            'cancelled' => method_exists($subscription, 'cancelled') ? $subscription->cancelled() : false,
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error loading Stripe subscription details', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error('Error in getCurrentSubscription', [
                'user_id' => $request->user() ? $request->user()->id : null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription status',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Add or update payment method
     */
    public function setupPaymentMethod(Request $request)
    {
        try {
            $user = $request->user();

            Log::info('Creating setup intent for user', ['user_id' => $user->id]);

            // Create Stripe setup intent
            $intent = $user->createSetupIntent();

            Log::info('Setup intent created successfully', [
                'user_id' => $user->id,
                'intent_id' => $intent->id
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $intent->client_secret,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating setup intent', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to setup payment method'
            ], 500);
        }
    }

    /**
     * Update payment method after Stripe confirmation
     * IMPORTANT: This endpoint is called after Stripe confirms the card setup
     */
    public function updatePaymentMethod(Request $request)
    {
        try {
            $user = $request->user();

            Log::info('Updating payment method for user', [
                'user_id' => $user->id,
                'has_stripe_id' => !empty($user->stripe_id)
            ]);

            // Give Stripe a moment to sync
            sleep(2);

            // Refresh user from database to get latest Stripe data
            $user->refresh();

            // Try to get payment method from Stripe
            try {
                if ($user->hasDefaultPaymentMethod()) {
                    $paymentMethod = $user->defaultPaymentMethod();

                    Log::info('Payment method retrieved from Stripe', [
                        'user_id' => $user->id,
                        'pm_id' => $paymentMethod->id ?? 'unknown',
                        'brand' => $paymentMethod->card->brand ?? 'unknown',
                        'last4' => $paymentMethod->card->last4 ?? 'unknown'
                    ]);

                    // Update user's payment method info in database
                    $updated = $user->update([
                        'pm_type' => $paymentMethod->card->brand ?? null,
                        'pm_last_four' => $paymentMethod->card->last4 ?? null,
                    ]);

                    Log::info('Payment method saved to database', [
                        'user_id' => $user->id,
                        'updated' => $updated,
                        'pm_type' => $paymentMethod->card->brand ?? null,
                        'pm_last_four' => $paymentMethod->card->last4 ?? null,
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Payment method updated successfully',
                        'payment_method' => [
                            'brand' => $paymentMethod->card->brand ?? 'unknown',
                            'last_four' => $paymentMethod->card->last4 ?? '****',
                            'exp_month' => $paymentMethod->card->exp_month ?? null,
                            'exp_year' => $paymentMethod->card->exp_year ?? null,
                        ]
                    ]);
                } else {
                    Log::warning('No default payment method found', [
                        'user_id' => $user->id,
                        'stripe_id' => $user->stripe_id
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'No payment method found. Please try again.'
                    ], 404);
                }
            } catch (\Exception $e) {
                Log::error('Error retrieving payment method from Stripe', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Could not retrieve payment method from Stripe'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error in updatePaymentMethod', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment method'
            ], 500);
        }
    }

    /**
     * Remove payment method
     */
    public function removePaymentMethod(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->hasDefaultPaymentMethod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No payment method to remove'
                ], 400);
            }

            // Don't allow removing payment method if there's an active subscription
            if ($user->subscribed('default') && !$user->subscription('default')->cancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove payment method while subscription is active. Please cancel your subscription first.'
                ], 400);
            }

            $user->deletePaymentMethods();

            // Clear user's payment method info
            $user->update([
                'pm_type' => null,
                'pm_last_four' => null,
            ]);

            Log::info('Payment method removed', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Payment method removed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing payment method', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove payment method'
            ], 500);
        }
    }

    /**
     * Create Stripe checkout session
     * CRITICAL: NO PLAN SWITCHING ALLOWED - Users with paid plans cannot change plans
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        try {
            $user = $request->user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            // Validate user can subscribe to this plan
            if ($plan->price == 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot subscribe to free plan'
                ], 400);
            }

            $currentPlan = $user->subscriptionPlan;

            // CRITICAL: Block all plan switching - users with ANY paid plan cannot change
            if ($currentPlan && $currentPlan->price > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an active paid subscription. Please cancel your current plan before purchasing a new one.'
                ], 400);
            }

            // Only allow if user is on free plan or has no plan
            if (!$currentPlan || $currentPlan->price == 0) {
                // Handle lifetime plan
                if ($plan->billing_period === 'lifetime') {
                    return $this->createLifetimeCheckout($user, $plan);
                }

                // Handle recurring plans (monthly/yearly)
                return $this->createRecurringCheckout($user, $plan);
            }

            return response()->json([
                'success' => false,
                'message' => 'Cannot change subscription plan'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Error creating checkout session', [
                'user_id' => $request->user()->id,
                'plan_id' => $request->plan_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session'
            ], 500);
        }
    }

    private function createLifetimeCheckout(User $user, SubscriptionPlan $plan)
    {
        // CRITICAL: Double-check user doesn't have paid plan
        if ($user->subscriptionPlan && $user->subscriptionPlan->price > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot purchase lifetime plan while having an active paid subscription'
            ], 400);
        }

        $checkoutSession = $user->checkout($plan->stripe_price_id, [
            'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('subscription.cancel'),
            'allow_promotion_codes' => true,
            'metadata' => [
                'plan_id' => $plan->id,
                'plan_type' => 'lifetime',
                'user_id' => $user->id,
            ],
        ]);

        Log::info('Lifetime checkout session created', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'session_id' => $checkoutSession->id
        ]);

        return response()->json([
            'success' => true,
            'checkout_url' => $checkoutSession->url,
        ]);
    }

    private function createRecurringCheckout(User $user, SubscriptionPlan $plan)
    {
        // CRITICAL: Double-check user doesn't have paid plan
        if ($user->subscriptionPlan && $user->subscriptionPlan->price > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot purchase subscription while having an active paid plan'
            ], 400);
        }

        // User should NOT have any active Stripe subscription
        if ($user->subscribed('default')) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active subscription'
            ], 400);
        }

        $checkout = $user->newSubscription('default', $plan->stripe_price_id)
            ->checkout([
                'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('subscription.cancel'),
                'allow_promotion_codes' => true,
                'metadata' => [
                    'plan_id' => $plan->id,
                    'plan_type' => $plan->billing_period,
                    'user_id' => $user->id,
                ],
            ]);

        Log::info('Recurring checkout session created', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'session_id' => $checkout->id
        ]);

        return response()->json([
            'success' => true,
            'checkout_url' => $checkout->url,
        ]);
    }

    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return redirect('/')->with('message', 'Subscription completed successfully!');
        }

        try {
            $user = Auth::user();

            // Don't update plan here - let webhook handle it
            // This prevents premature plan updates before payment is confirmed

            Log::info('Subscription success page accessed', [
                'user_id' => $user->id,
                'session_id' => $sessionId
            ]);

            return redirect('/')->with('success', 'Subscription activated successfully!');
        } catch (\Exception $e) {
            Log::error('Error handling subscription success', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);

            return redirect('/')->with('message', 'Subscription completed!');
        }
    }

    public function cancel()
    {
        return redirect('/')->with('message', 'Subscription checkout was cancelled.');
    }

    public function cancelSubscription(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->subscribed('default')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription to cancel'
                ], 400);
            }

            $user->subscription('default')->cancel();

            Log::info('Subscription cancelled', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription will be cancelled at the end of the billing period'
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling subscription', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription'
            ], 500);
        }
    }

    public function resumeSubscription(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->subscribed('default')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No subscription to resume'
                ], 400);
            }

            $subscription = $user->subscription('default');

            if (!$subscription->onGracePeriod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription is not cancelled'
                ], 400);
            }

            $subscription->resume();

            Log::info('Subscription resumed', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription resumed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error resuming subscription', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resume subscription'
            ], 500);
        }
    }

    public function updateAutoRenew(Request $request)
    {
        $request->validate([
            'auto_renew' => 'required|boolean',
        ]);

        try {
            $user = $request->user();

            if (!$user->subscribed('default')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription'
                ], 400);
            }

            $subscription = $user->subscription('default');

            if ($request->auto_renew) {
                if ($subscription->onGracePeriod()) {
                    $subscription->resume();
                }
            } else {
                if (!$subscription->cancelled()) {
                    $subscription->cancel();
                }
            }

            $user->update(['auto_renew' => $request->auto_renew]);

            Log::info('Auto-renew updated', [
                'user_id' => $user->id,
                'auto_renew' => $request->auto_renew
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Auto-renewal setting updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating auto-renewal', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update auto-renewal setting'
            ], 500);
        }
    }

    public function getPaymentHistory(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->hasStripeId()) {
                return response()->json([
                    'success' => true,
                    'invoices' => []
                ]);
            }

            $invoices = $user->invoices()->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'date' => $invoice->date()->toFormattedDateString(),
                    'total' => $invoice->total(),
                    'status' => $invoice->status,
                    'invoice_pdf' => $invoice->invoice_pdf,
                ];
            });

            return response()->json([
                'success' => true,
                'invoices' => $invoices
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payment history', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment history'
            ], 500);
        }
    }

    public function downloadInvoice(Request $request, $invoiceId)
    {
        try {
            $user = $request->user();

            return $user->downloadInvoice($invoiceId, [
                'vendor' => config('app.name'),
                'product' => 'Subscription',
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloading invoice', [
                'user_id' => $request->user()->id,
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to download invoice'
            ], 404);
        }
    }
}
