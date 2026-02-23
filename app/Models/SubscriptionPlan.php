<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'stripe_price_id',
        'features',
        'max_boards',
        'max_libraries_per_board',
        'can_share',
        'daily_previews',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'max_boards' => 'integer',
        'max_libraries_per_board' => 'integer',
        'can_share' => 'boolean',
        'daily_previews' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'subscription_plan_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeFree($query)
    {
        return $query->where('price', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('price', '>', 0);
    }

    // Accessors
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Free';
        }

        if ($this->billing_period === 'lifetime') {
            return '$' . number_format($this->price, 2) . ' one-time';
        }

        return '$' . number_format($this->price, 2) . '/' . $this->billing_period;
    }

    public function getIsFreePlanAttribute(): bool
    {
        return $this->price == 0;
    }

    public function getIsPaidPlanAttribute(): bool
    {
        return $this->price > 0;
    }

    public function getIsLifetimePlanAttribute(): bool
    {
        return $this->billing_period === 'lifetime';
    }

    public function getIsRecurringPlanAttribute(): bool
    {
        return in_array($this->billing_period, ['monthly', 'yearly']);
    }
}
