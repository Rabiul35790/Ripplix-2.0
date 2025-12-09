<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CustomResetPasswordNotification;
use Spatie\Permission\Traits\HasRoles;
use Filament\Panel;
use Filament\Models\Contracts\FilamentUser;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;


class User extends Authenticatable implements FilamentUser, MustVerifyEmail
{
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'is_active',
        'pricing_plan_id',
        'plan_updated_at',
        'plan_expires_at',
        'trial_taken',
        'verification_code',
        'verification_code_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'plan_updated_at' => 'datetime',
            'plan_expires_at' => 'datetime',
            'trial_taken' => 'boolean',
            'verification_code_expires_at' => 'datetime',
        ];
    }

    public function generateVerificationCode(): string
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->update([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        return $code;
    }

    public function isVerificationCodeValid(string $code): bool
    {
        return $this->verification_code === $code
            && $this->verification_code_expires_at
            && $this->verification_code_expires_at->isFuture();
    }

    public function clearVerificationCode(): void
    {
        $this->update([
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);
    }

    // Relationships
    public function pricingPlan(): BelongsTo
    {
        return $this->belongsTo(PricingPlan::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function supportReplies()
    {
        return $this->hasMany(SupportReply::class);
    }

    public function boards()
    {
        return $this->hasMany(Board::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeExpiredSubscriptions($query)
    {
        return $query->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '<', now())
            ->whereHas('pricingPlan', function ($q) {
                $q->whereIn('billing_period', ['monthly', 'yearly']);
            });
    }

    // NEW: Plan Type Helper Methods
    public function isFreePlan(): bool
    {
        if (!$this->pricingPlan) {
            return true; // No plan = free
        }

        return $this->pricingPlan->price == 0;
    }

    public function isPaidPlan(): bool
    {
        return !$this->isFreePlan();
    }

    public function isVisitorPlan(): bool
    {
        return $this->pricingPlan && $this->pricingPlan->slug === 'visitor';
    }

    public function isFreeMemberPlan(): bool
    {
        return $this->pricingPlan && $this->pricingPlan->slug === 'free-member';
    }

    public function isProPlan(): bool
    {
        return $this->pricingPlan && in_array($this->pricingPlan->slug, ['pro-monthly', 'pro-yearly', 'lifetime-pro']);
    }

    public function canShareBoards(): bool
    {
        return $this->isPaidPlan();
    }

    public function getMaxBoardsAllowed(): int
    {
        if ($this->isPaidPlan()) {
            return PHP_INT_MAX; // Unlimited for paid plans
        }

        if ($this->isVisitorPlan()) {
            return 0; // Visitors can't create boards
        }

        return 3; // Free members get 3 boards
    }

    public function getMaxLibrariesPerBoard(): int
    {
        if ($this->isPaidPlan()) {
            return PHP_INT_MAX; // Unlimited for paid plans
        }

        if ($this->isVisitorPlan()) {
            return 0; // Visitors can't add libraries
        }

        return 6; // Free members get 6 libraries per board
    }

    public function getCurrentBoardCount(): int
    {
        return $this->boards()->count();
    }

    public function canCreateMoreBoards(): bool
    {
        return $this->getCurrentBoardCount() < $this->getMaxBoardsAllowed();
    }

    public function canAddLibraryToBoard(Board $board): bool
    {
        if ($this->isPaidPlan()) {
            return true;
        }

        $currentLibraryCount = $board->libraries()->count();
        return $currentLibraryCount < $this->getMaxLibrariesPerBoard();
    }

    // NEW: Get Plan Limits Array (for easy frontend consumption)
    public function getPlanLimits(): array
    {
        $cacheKey = "user_limits_{$this->id}_{$this->pricing_plan_id}";

        return Cache::remember($cacheKey, 600, function () {
            $isFree = $this->isFreePlan();
            $isPaid = !$isFree;

            return [
                'isFree' => $isFree,
                'isPaid' => $isPaid,
                'maxBoards' => $isPaid ? PHP_INT_MAX : ($this->isVisitorPlan() ? 0 : 3),
                'maxLibrariesPerBoard' => $isPaid ? PHP_INT_MAX : ($this->isVisitorPlan() ? 0 : 6),
                'canShare' => $isPaid,
                'planName' => $this->pricingPlan ? $this->pricingPlan->name : 'No Plan',
                'planSlug' => $this->pricingPlan ? $this->pricingPlan->slug : null,
                'currentBoardCount' => $this->getCurrentBoardCount(),
                'canCreateMoreBoards' => $this->canCreateMoreBoards(),
            ];
        });
    }

    // Subscription Management Methods
    public function isSubscriptionExpired(): bool
    {
        if (!$this->plan_expires_at) {
            return false; // Lifetime or free plans don't expire
        }
        return $this->plan_expires_at->isPast();
    }

    public function subscriptionExpiresSoon(): bool
    {
        if (!$this->plan_expires_at) {
            return false;
        }
        return $this->plan_expires_at->isBefore(now()->addDays(7));
    }

    public function daysUntilExpiry(): ?int
    {
        if (!$this->plan_expires_at) {
            return null;
        }
        return now()->diffInDays($this->plan_expires_at, false);
    }

    /**
     * Automatic subscription upgrade/renewal
     */
    public function upgradeSubscription(PricingPlan $plan): void
    {
        $currentTime = now();
        $expiresAt = null;

        $isRenewal = $this->pricing_plan_id === $plan->id &&
                    $this->plan_expires_at &&
                    $this->plan_expires_at->isFuture();

        if ($plan->billing_period === 'monthly') {
            $expiresAt = $isRenewal
                ? $this->plan_expires_at->addMonth()
                : $currentTime->copy()->addMonth();
        } elseif ($plan->billing_period === 'yearly') {
            $expiresAt = $isRenewal
                ? $this->plan_expires_at->addYear()
                : $currentTime->copy()->addYear();
        }

        DB::transaction(function () use ($plan, $currentTime, $expiresAt) {
            DB::table('users')
                ->where('id', $this->id)
                ->update([
                    'pricing_plan_id' => $plan->id,
                    'plan_updated_at' => $currentTime,
                    'plan_expires_at' => $expiresAt,
                    'updated_at' => $currentTime,
                ]);
        });

        // Wait for commit before refreshing
        DB::afterCommit(function () use ($plan) {
            $this->clearPlanCaches();
            $this->refresh();

            Log::info("User {$this->id} subscription " .
                ($this->pricing_plan_id === $plan->id ? 'renewed' : 'upgraded'));
        });
    }



    public function clearPlanCaches(): void
    {
        Cache::forget("user_plan_{$this->id}_{$this->pricing_plan_id}");
        Cache::forget("user_limits_{$this->id}_{$this->pricing_plan_id}");
    }

    /**
     * Automatic downgrade to free member plan (Plan ID 2)
     */
    public function downgradeToFreeMember(): void
    {
        $freeMemberPlan = PricingPlan::find(2);

        if ($freeMemberPlan) {
            DB::transaction(function () use ($freeMemberPlan) {
                DB::table('users')
                    ->where('id', $this->id)
                    ->update([
                        'pricing_plan_id' => $freeMemberPlan->id,
                        'plan_updated_at' => now(),
                        'plan_expires_at' => null,
                        'updated_at' => now(),
                    ]);
            });

            DB::afterCommit(function () {
                $this->clearPlanCaches();
                $this->refresh();
                Log::info("User {$this->id} automatically downgraded to free member plan");
            });
        }
    }

    /**
     * Check and handle expired subscription automatically
     */
    public function checkAndHandleExpiredSubscription(): void
    {
        if ($this->isSubscriptionExpired()) {
            $this->downgradeToFreeMember();
        }
    }

    // Helper methods
    public function hasPricingPlan(): bool
    {
        return !is_null($this->pricing_plan_id);
    }

    public function getCurrentPlanName(): string
    {
        return $this->pricingPlan ? $this->pricingPlan->name : 'No Plan';
    }

    public function shouldHaveLifetimePlan(): bool
    {
        return $this->roles()->exists();
    }


     public function getCurrentPlan()
    {
        if (!$this->pricing_plan_id) {
            return null;
        }

        // Cache key unique to user and plan
        $cacheKey = "user_plan_{$this->id}_{$this->pricing_plan_id}";

        return Cache::remember($cacheKey, 300, function () {
            if (!$this->pricingPlan) {
                return null;
            }

            return [
                'id' => $this->pricingPlan->id,
                'name' => $this->pricingPlan->name,
                'slug' => $this->pricingPlan->slug ?? null,
                'price' => $this->pricingPlan->price ?? 0,
                'billing_period' => $this->pricingPlan->billing_period ?? 'monthly',
                'expires_at' => $this->plan_expires_at ?? null,
                'days_until_expiry' => $this->daysUntilExpiry(),
            ];
        });
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            if (str_starts_with($this->avatar, 'http')) {
                return $this->avatar;
            }
            if (str_starts_with($this->avatar, '/storage/')) {
                return url($this->avatar);
            }
            return url('/storage/avatars/' . $this->avatar);
        }
        return '';
    }

    public function hasUploadedAvatar(): bool
    {
        return $this->avatar && !str_contains($this->avatar, 'googleusercontent.com');
    }

    /**
     * Boot method - Auto-handle expired subscriptions on model access
     */
    public static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            // Defer automatic plan assignment to after transaction commits
            DB::afterCommit(function () use ($user) {
                $user->assignAutomaticPlan();
            });
        });

        static::retrieved(function ($user) {
            // Check for expired subscriptions asynchronously
            if ($user->isSubscriptionExpired()) {
                // Use a queued job or defer this to avoid blocking
                dispatch(function () use ($user) {
                    $user->downgradeToFreeMember();
                })->afterResponse();
            }
        });

        static::saving(function ($user) {
            // Clear caches before save to prevent stale reads
            if ($user->isDirty(['pricing_plan_id', 'plan_expires_at', 'plan_updated_at'])) {
                $user->clearPlanCaches();
            }
        });

        static::saved(function ($user) {
            // Clear caches after save and wait for write
            DB::afterCommit(function () use ($user) {
                $user->clearPlanCaches();

                if ($user->shouldHaveLifetimePlan() &&
                    (!$user->pricingPlan || $user->pricingPlan->slug !== 'lifetime-pro')) {
                    $user->assignLifetimePlan();
                }
            });
        });

        static::deleting(function ($user) {
            // Clear caches on delete
            $user->clearPlanCaches();

            if ($user->hasUploadedAvatar()) {
                $avatarPath = str_replace('/storage/', '', $user->avatar);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($avatarPath)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($avatarPath);
                }
            }
        });
    }

    public function assignAutomaticPlan()
    {
        if ($this->shouldHaveLifetimePlan()) {
            $this->assignLifetimePlan();
            return;
        }

        // Auto-assign to Plan ID 2 (Free Member)
        if (!$this->pricing_plan_id) {
            $this->update(['pricing_plan_id' => 2]);
        }
    }

    public function assignLifetimePlan()
    {
        $lifetimePlan = PricingPlan::where('slug', 'lifetime-pro')->first();
        if ($lifetimePlan) {
            $this->update([
                'pricing_plan_id' => $lifetimePlan->id,
                'plan_updated_at' => now(),
                'plan_expires_at' => null,
            ]);
        }
    }

    public static function getFreeMembersCount(): int
    {
        return static::active()->where('pricing_plan_id', 2)->count();
    }

    public function getBoardsCount(): int
    {
        return $this->boards()->count();
    }




    public function hasTrialTaken(): bool
    {
        return $this->trial_taken;
    }

    /**
     * Check if user is eligible for free trial
     */
    public function canTakeTrial(): bool
    {
        return $this->isFreeMemberPlan() && !$this->hasTrialTaken();
    }

    /**
     * Check if user is currently on trial
     */
    public function isOnTrial(): bool
    {
        if (!$this->pricingPlan || $this->pricingPlan->slug !== 'pro-monthly') {
            return false;
        }

        // Check if expires within 7 days (indicating it's a trial)
        if ($this->plan_expires_at && $this->daysUntilExpiry() !== null) {
            $daysRemaining = $this->daysUntilExpiry();
            return $daysRemaining >= 0 && $daysRemaining <= 7 && $this->trial_taken;
        }

        return false;
    }


    public function startFreeTrial(): void
    {
        $proMonthlyPlan = PricingPlan::where('slug', 'pro-monthly')->first();

        if (!$proMonthlyPlan) {
            throw new \Exception('Pro monthly plan not found');
        }

        if (!$this->canTakeTrial()) {
            throw new \Exception('User is not eligible for free trial');
        }

        $currentTime = now();
        $expiresAt = $currentTime->copy()->addDays(7);

        DB::transaction(function () use ($proMonthlyPlan, $currentTime, $expiresAt) {
            DB::table('users')
                ->where('id', $this->id)
                ->update([
                    'pricing_plan_id' => $proMonthlyPlan->id,
                    'plan_updated_at' => $currentTime,
                    'plan_expires_at' => $expiresAt,
                    'trial_taken' => true,
                    'updated_at' => $currentTime,
                ]);
        });

        DB::afterCommit(function () use ($expiresAt) {
            $this->clearPlanCaches();
            $this->refresh();
            Log::info("User {$this->id} started free trial, expires: {$expiresAt->toDateString()}");
        });
    }


    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }

}
