<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $maxValue = 2147483647; // Maximum signed INT value for MySQL

        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Great for regular users who want more access',
                'price' => 0.00,
                'billing_period' => 'free',
                'stripe_price_id' => null,
                'features' => json_encode([
                    'Grid/List: Full grid & search results',
                    'Boards: Up to 3 boards',
                    'Full grid and search access',
                    '6 Interaction in each board',
                    'Email digest of new clips (weekly)'
                ]),
                'max_boards' => 3,
                'max_libraries_per_board' => 6,
                'can_share' => false,
                'daily_previews' => 15,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro Monthly',
                'slug' => 'pro-monthly',
                'description' => 'Perfect for professionals and power users',
                'price' => 4.99,
                'billing_period' => 'monthly',
                'stripe_price_id' => env('STRIPE_PRICE_PRO_MONTHLY'),
                'features' => json_encode([
                    'Grid/List: Full',
                    'Daily Previews: Unlimited',
                    'Boards: Unlimited',
                    'Board Sharing Available',
                    'Unlimited everything'
                ]),
                'max_boards' => $maxValue,
                'max_libraries_per_board' => $maxValue,
                'can_share' => true,
                'daily_previews' => null,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro Yearly',
                'slug' => 'pro-yearly',
                'description' => 'Best value - save 33% with annual billing',
                'price' => 42.00,
                'billing_period' => 'yearly',
                'stripe_price_id' => env('STRIPE_PRICE_PRO_YEARLY'),
                'features' => json_encode([
                    'Grid/List: Full',
                    'Daily Previews: Unlimited',
                    'Boards: Unlimited',
                    'Board Sharing Unlimited',
                    'Same as Monthly + early-access betas',
                    'All Pro features'
                ]),
                'max_boards' => $maxValue,
                'max_libraries_per_board' => $maxValue,
                'can_share' => true,
                'daily_previews' => null,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Lifetime Pro',
                'slug' => 'lifetime-pro',
                'description' => 'One payment, lifetime access to all Pro features',
                'price' => 100.00,
                'billing_period' => 'lifetime',
                'stripe_price_id' => env('STRIPE_PRICE_LIFETIME_PRO'),
                'features' => json_encode([
                    'Grid/List: Full',
                    'Daily Previews: Unlimited',
                    'Boards: Unlimited',
                    'Board Sharing Unlimited',
                    'All Pro features forever'
                ]),
                'max_boards' => $maxValue,
                'max_libraries_per_board' => $maxValue,
                'can_share' => true,
                'daily_previews' => null,
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
