<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class PricingPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'billing_period',
        'original_price',
        'currency',
        'grid_list_visibility',
        'daily_previews',
        'boards_create',
        'board_sharing',
        'ads',
        'extras',
        'is_active',
        'sort_order',
        'is_featured',
        'student_discount_percentage',
        'student_verification_required',
        'description',
        'features',
        'button_text',
        'button_color',
        'highlight_color',
        'meta_title',
        'meta_description',
        'trial_days',
        'max_renewals',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'board_sharing' => 'boolean',
        'ads' => 'boolean',
        'student_verification_required' => 'boolean',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'student_discount_percentage' => 'integer',
        'sort_order' => 'integer',
        'trial_days' => 'integer',
        'max_renewals' => 'integer',
    ];

    protected $attributes = [
        'currency' => 'USD',
        'is_active' => true,
        'sort_order' => 0,
        'button_text' => 'Choose Plan',
        'button_color' => '#3B82F6',
        'trial_days' => 0,
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function activeUsers(): HasMany
    {
        return $this->hasMany(User::class)->where('is_active', true);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function completedPayments(): HasMany
    {
        return $this->hasMany(Payment::class)->where('status', 'completed');
    }

    // Scopes
    public function scopeActive($query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    public function scopeWithUserCounts($query): Builder
    {
        return $query->withCount(['users', 'activeUsers']);
    }

    public function scopePaid($query): Builder
    {
        return $query->where('price', '>', 0);
    }

    public function scopeFree($query): Builder
    {
        return $query->where('price', 0);
    }

    public function scopeSubscription($query): Builder
    {
        return $query->whereIn('billing_period', ['monthly', 'yearly']);
    }

    public function scopeLifetime($query): Builder
    {
        return $query->where('billing_period', 'lifetime');
    }

    public function scopeByBillingPeriod($query, string $period): Builder
    {
        return $query->where('billing_period', $period);
    }

    // Accessors
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Free';
        }

        $symbol = $this->currency === 'USD' ? '$' : $this->currency;

        if ($this->billing_period === 'yearly') {
            $monthlyPrice = $this->price / 12;
            return $symbol . number_format($this->price, 0) . '/yr (≈ $' . number_format($monthlyPrice, 0) . '/mo)';
        }

        return $symbol . number_format($this->price, 0) . '/' . $this->billing_period;
    }

    public function getStudentPriceAttribute(): float
    {
        if (!$this->student_discount_percentage || $this->price == 0) {
            return $this->price;
        }

        return $this->price * (1 - $this->student_discount_percentage / 100);
    }

    public function getFormattedStudentPriceAttribute(): ?string
    {
        if (!$this->student_discount_percentage || $this->price == 0) {
            return null;
        }

        $symbol = $this->currency === 'USD' ? '$' : $this->currency;
        $studentPrice = $this->getStudentPriceAttribute();

        if ($this->billing_period === 'yearly') {
            $monthlyPrice = $studentPrice / 12;
            return $symbol . number_format($studentPrice, 0) . '/yr (≈ $' . number_format($monthlyPrice, 0) . '/mo)';
        }

        return $symbol . number_format($studentPrice, 0) . '/' . $this->billing_period;
    }

    public function getUsersCountAttribute(): int
    {
        if ($this->slug === 'visitor') {
            return VisitorSession::getActiveVisitorsCount();
        }

        return $this->users()->count();
    }

    public function getActiveUsersCountAttribute(): int
    {
        if ($this->slug === 'visitor') {
            return VisitorSession::getActiveVisitorsCount();
        }

        return $this->activeUsers()->count();
    }

    public function getActiveSubscribersCountAttribute(): int
    {
        if ($this->isFreePlan() || $this->billing_period === 'lifetime') {
            return $this->activeUsers()->count();
        }

        // For subscription plans, only count non-expired users
        return $this->activeUsers()
            ->where(function ($query) {
                $query->whereNull('plan_expires_at')
                      ->orWhere('plan_expires_at', '>', now());
            })
            ->count();
    }

    public function getMonthlyRevenueAttribute(): float
    {
        if ($this->slug === 'visitor' || $this->isFreePlan()) {
            return 0;
        }

        $activeSubscribers = $this->getActiveSubscribersCountAttribute();

        if ($this->billing_period === 'monthly') {
            return $activeSubscribers * $this->price;
        } elseif ($this->billing_period === 'yearly') {
            return $activeSubscribers * ($this->price / 12);
        }

        return 0; // Lifetime plans don't contribute to recurring revenue
    }

    // Helper methods
    public function isFreePlan(): bool
    {
        return $this->price == 0;
    }

    public function isPaidPlan(): bool
    {
        return $this->price > 0;
    }

    public function isSubscriptionPlan(): bool
    {
        return in_array($this->billing_period, ['monthly', 'yearly']);
    }

    public function isLifetimePlan(): bool
    {
        return $this->billing_period === 'lifetime';
    }

    public function hasStudentDiscount(): bool
    {
        return $this->student_discount_percentage > 0;
    }

    public function hasUsers(): bool
    {
        if ($this->slug === 'visitor') {
            return VisitorSession::getActiveVisitorsCount() > 0;
        }

        return $this->users()->exists();
    }

    public function getTotalRevenue(): float
    {
        if ($this->slug === 'visitor') {
            return 0;
        }

        return $this->completedPayments()->sum('amount');
    }

    public function getAverageMonthlyRevenue(): float
    {
        if ($this->isFreePlan()) {
            return 0;
        }

        $totalRevenue = $this->getTotalRevenue();

        if ($totalRevenue == 0) {
            return 0;
        }

        // Get the number of months since first payment
        $firstPayment = $this->completedPayments()->oldest()->first();

        if (!$firstPayment) {
            return 0;
        }

        $monthsSinceFirst = $firstPayment->paid_at->diffInMonths(now()) ?: 1;

        return $totalRevenue / $monthsSinceFirst;
    }

    /**
     * Get conversion rate from free to this plan
     */
    public function getConversionRate(): float
    {
        if ($this->isFreePlan()) {
            return 0;
        }

        $totalUsers = User::active()->count();
        $planUsers = $this->getActiveSubscribersCountAttribute();

        return $totalUsers > 0 ? ($planUsers / $totalUsers) * 100 : 0;
    }

    /**
     * Check if plan can be downgraded to
     */
    public function canBeDowngradedTo(): bool
    {
        return $this->slug === 'free-member';
    }

    /**
     * Get upgrade path suggestions
     */
    public function getUpgradeSuggestions(): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
            ->where('price', '>', $this->price)
            ->ordered()
            ->limit(2)
            ->get();
    }

    /**
     * Get real-time user count for each plan type
     */
    public static function getUserCountsByPlan(): array
    {
        $counts = [
            'visitor' => VisitorSession::getActiveVisitorsCount(),
            'free_member' => User::getFreeMembersCount(),
            'paid_users' => 0,
            'lifetime_users' => 0,
            'active_subscriptions' => 0,
            'expired_subscriptions' => 0,
        ];

        $paidPlans = static::where('price', '>', 0)
            ->where('billing_period', '!=', 'lifetime')
            ->pluck('id');

        $lifetimePlans = static::where('billing_period', 'lifetime')
            ->pluck('id');

        // Active paid subscribers (not expired)
        $counts['paid_users'] = User::active()
            ->whereIn('pricing_plan_id', $paidPlans)
            ->where(function ($query) {
                $query->whereNull('plan_expires_at')
                      ->orWhere('plan_expires_at', '>', now());
            })
            ->count();

        $counts['lifetime_users'] = User::active()
            ->whereIn('pricing_plan_id', $lifetimePlans)
            ->count();

        $counts['active_subscriptions'] = $counts['paid_users'];

        // Expired subscriptions pending downgrade
        $counts['expired_subscriptions'] = User::expiredSubscriptions()->count();

        return $counts;
    }

    /**
     * Get plan by slug with caching
     */
    public static function findBySlug(string $slug): ?self
    {
        return cache()->remember(
            "pricing_plan_{$slug}",
            now()->addHours(24),
            fn() => static::where('slug', $slug)->first()
        );
    }

    /**
     * Clear plan cache when updated
     */
    public static function boot()
    {
        parent::boot();

        // Clear caches when any pricing plan changes
        static::saved(function ($plan) {
            static::clearAllPricingCaches();
            Log::info("Pricing plan {$plan->slug} updated, cache cleared");
        });

        static::deleted(function ($plan) {
            static::clearAllPricingCaches();
            Log::info("Pricing plan {$plan->slug} deleted, cache cleared");
        });

        static::created(function ($plan) {
            static::clearAllPricingCaches();
            Log::info("Pricing plan {$plan->slug} created, cache cleared");
        });
    }

    /**
     * Clear all pricing-related caches
     */
    private static function clearAllPricingCaches(): void
    {
        \Illuminate\Support\Facades\Cache::forget('pricing_plans_active_' . md5('plans_list'));

        // Clear individual plan caches
        static::all()->each(function ($plan) {
            \Illuminate\Support\Facades\Cache::forget("pricing_plan_{$plan->slug}");
        });

        // You might want to clear user caches too when prices change significantly
        // But this could be expensive, so use judiciously
        // \Illuminate\Support\Facades\Cache::flush();
    }
}
