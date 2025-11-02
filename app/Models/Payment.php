<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'pricing_plan_id',
        'payment_gateway_id',
        'transaction_id',
        'gateway_transaction_id',
        'amount',
        'currency',
        'status',
        'gateway_response',
        'paid_at',
        'subscription_start_date',
        'subscription_end_date',
        'is_renewal'
    ];

    protected $casts = [
        'gateway_response' => 'array',
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'subscription_start_date' => 'datetime',
        'subscription_end_date' => 'datetime',
        'is_renewal' => 'boolean'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pricingPlan(): BelongsTo
    {
        return $this->belongsTo(PricingPlan::class);
    }

    public function paymentGateway(): BelongsTo
    {
        return $this->belongsTo(PaymentGateway::class);
    }

    // Scopes
    public function scopeCompleted($query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query): Builder
    {
        return $query->where('status', 'failed');
    }

    public function scopeForUser($query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPlan($query, $planId): Builder
    {
        return $query->where('pricing_plan_id', $planId);
    }

    public function scopeRenewals($query): Builder
    {
        return $query->where('is_renewal', true);
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isRenewal(): bool
    {
        return $this->is_renewal;
    }

    public function getFormattedAmountAttribute(): string
    {
        $symbol = $this->currency === 'USD' ? '$' : $this->currency;
        return $symbol . number_format($this->amount, 2);
    }

    /**
     * Automatically complete payment and update user subscription
     */
    public function markAsCompleted($gatewayTransactionId = null, $gatewayResponse = null): void
    {
        try {
            DB::transaction(function () use ($gatewayTransactionId, $gatewayResponse) {
                // Update payment status
                $this->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_transaction_id' => $gatewayTransactionId ?: $this->gateway_transaction_id,
                    'gateway_response' => $gatewayResponse ?: $this->gateway_response,
                ]);

                // Determine if this is a renewal
                $user = $this->user;
                $plan = $this->pricingPlan;

                $isRenewal = $user->pricing_plan_id === $plan->id &&
                            $user->plan_expires_at &&
                            $user->plan_expires_at->isFuture();

                // Update renewal status
                $this->update(['is_renewal' => $isRenewal]);

                // Calculate subscription period
                $subscriptionPeriod = $this->calculateSubscriptionPeriod();

                // Update subscription dates in payment record
                $this->update([
                    'subscription_start_date' => $subscriptionPeriod['start_date'],
                    'subscription_end_date' => $subscriptionPeriod['end_date'],
                ]);

                // Update user's subscription immediately
                $user->upgradeSubscription($plan);

                Log::info("Payment {$this->id} completed automatically - User {$user->id} subscription " . ($isRenewal ? 'renewed' : 'upgraded') . " to plan {$plan->slug}");
            });
        } catch (\Exception $e) {
            Log::error("Failed to complete payment {$this->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate subscription period for this payment
     */
    public function calculateSubscriptionPeriod(): array
    {
        $plan = $this->pricingPlan;
        $user = $this->user;

        $startDate = now();
        $endDate = null;

        if ($plan->billing_period === 'monthly') {
            if ($user->plan_expires_at && $user->plan_expires_at->isFuture() && $user->pricing_plan_id === $plan->id) {
                $startDate = $user->plan_expires_at;
                $endDate = $startDate->copy()->addMonth();
            } else {
                $endDate = $startDate->copy()->addMonth();
            }
        } elseif ($plan->billing_period === 'yearly') {
            if ($user->plan_expires_at && $user->plan_expires_at->isFuture() && $user->pricing_plan_id === $plan->id) {
                $startDate = $user->plan_expires_at;
                $endDate = $startDate->copy()->addYear();
            } else {
                $endDate = $startDate->copy()->addYear();
            }
        }
        // Lifetime plans don't have end date

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }

    /**
     * Auto-detect renewal based on user's current plan
     */
    public function detectRenewal(): bool
    {
        $user = $this->user;
        $plan = $this->pricingPlan;

        return $user->pricing_plan_id === $plan->id &&
               $user->plan_expires_at &&
               $user->plan_expires_at->isFuture();
    }

    /**
     * Boot method - Handle automatic payment completion
     */
    public static function boot()
    {
        parent::boot();

        // Auto-detect renewal when payment is created
        static::creating(function ($payment) {
            if (!isset($payment->is_renewal)) {
                $payment->is_renewal = $payment->detectRenewal();
            }
        });

        // Auto-handle successful webhook updates
        static::updated(function ($payment) {
            if ($payment->wasChanged('gateway_transaction_id') &&
                $payment->status === 'completed' &&
                !$payment->paid_at) {

                $payment->markAsCompleted();
            }
        });
    }
}
