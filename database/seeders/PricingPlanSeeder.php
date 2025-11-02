<?php

namespace Database\Seeders;

use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PricingPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Visitor',
                'slug' => 'visitor',
                'billing_period' => 'free',
                'price' => 0,
                'grid_list_visibility' => 'Only first 12 cards per collection / search (rest blurred)',
                'daily_previews' => 'Unlimited for those 12',
                'boards_create' => '✗',
                'board_sharing' => false,
                'ads' => true,
                'extras' => 'Carbon / sponsor',
                'sort_order' => 1,
                'description' => 'Perfect for exploring and getting started',
                'button_text' => 'Start Free',
                'features' => [
                    ['feature' => 'Access to first 12 cards per collection'],
                    ['feature' => 'Unlimited previews for visible cards'],
                    ['feature' => 'Community support'],
                ],
            ],
            [
                'name' => 'Free Member',
                'slug' => 'free-member',
                'billing_period' => 'free',
                'price' => 0,
                'grid_list_visibility' => 'Full grid & search results',
                'daily_previews' => '15 previews / day',
                'boards_create' => 'Up to 3 boards',
                'board_sharing' => false,
                'ads' => true,
                'extras' => 'Email digest of new clips (weekly)',
                'sort_order' => 2,
                'description' => 'Great for regular users who want more access',
                'button_text' => 'Sign Up Free',
                'features' => [
                    ['feature' => 'Full grid and search access'],
                    ['feature' => '15 daily previews'],
                    ['feature' => 'Create up to 3 boards'],
                    ['feature' => 'Weekly email digest'],
                ],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro-monthly',
                'billing_period' => 'monthly',
                'price' => 9,
                'grid_list_visibility' => 'Full',
                'daily_previews' => 'Unlimited',
                'boards_create' => 'Unlimited',
                'board_sharing' => true,
                'ads' => false,
                'extras' => 'Daily "Fresh-20" update • Priority support • 2-week Pro per referral',
                'sort_order' => 3,
                'is_featured' => true,
                'student_discount_percentage' => 30,
                'student_verification_required' => true,
                'description' => 'Perfect for professionals and power users',
                'button_text' => 'Start Pro Trial',
                'button_color' => '#10B981',
                'highlight_color' => '#10B981',
                'features' => [
                    ['feature' => 'Unlimited everything'],
                    ['feature' => 'Board sharing capabilities'],
                    ['feature' => 'No advertisements'],
                    ['feature' => 'Daily Fresh-20 updates'],
                    ['feature' => 'Priority customer support'],
                    ['feature' => 'Referral rewards'],
                ],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro-yearly',
                'billing_period' => 'yearly',
                'price' => 72,
                'original_price' => 108,
                'grid_list_visibility' => 'Full',
                'daily_previews' => 'Unlimited',
                'boards_create' => 'Unlimited',
                'board_sharing' => true,
                'ads' => false,
                'extras' => 'Same as Monthly + early-access betas',
                'sort_order' => 4,
                'student_discount_percentage' => 30,
                'student_verification_required' => true,
                'description' => 'Best value - save 33% with annual billing',
                'button_text' => 'Save with Yearly',
                'button_color' => '#10B981',
                'features' => [
                    ['feature' => 'All Pro features'],
                    ['feature' => 'Early access to beta features'],
                    ['feature' => 'Save 33% vs monthly'],
                ],
            ],
            [
                'name' => 'Lifetime Pro',
                'slug' => 'lifetime-pro',
                'billing_period' => 'lifetime',
                'price' => 180,
                'original_price' => 500,
                'grid_list_visibility' => 'Full',
                'daily_previews' => 'Unlimited',
                'boards_create' => 'Unlimited',
                'board_sharing' => true,
                'ads' => false,
                'extras' => 'All Pro perks forever',
                'sort_order' => 5,
                'student_discount_percentage' => 30,
                'student_verification_required' => true,
                'description' => 'One payment, lifetime access to all Pro features',
                'button_text' => 'Get Lifetime Access',
                'button_color' => '#8B5CF6',
                'highlight_color' => '#8B5CF6',
                'features' => [
                    ['feature' => 'All Pro features forever'],
                    ['feature' => 'No recurring payments'],
                    ['feature' => 'Future feature updates included'],
                    ['feature' => 'Exclusive lifetime member perks'],
                ],
            ],
        ];

        // Create pricing plans and store references
        $createdPlans = [];
        foreach ($plans as $planData) {
            $createdPlans[] = PricingPlan::create($planData);
        }

        // Assign random users to plans (if users exist)
        $users = User::all();

        if ($users->count() > 0) {
            // Get plan references by slug for easier assignment
            $visitorPlan = collect($createdPlans)->firstWhere('slug', 'visitor');
            $freeMemberPlan = collect($createdPlans)->firstWhere('slug', 'free-member');
            $proMonthlyPlan = collect($createdPlans)->firstWhere('slug', 'pro-monthly');
            $proYearlyPlan = collect($createdPlans)->firstWhere('slug', 'pro-yearly');
            $lifetimePlan = collect($createdPlans)->firstWhere('slug', 'lifetime-pro');

            // Assign users to visitor plan (30% of users)
            $visitorUsers = $users->random(min(ceil($users->count() * 0.3), $users->count()));
            foreach ($visitorUsers as $user) {
                $user->update(['pricing_plan_id' => $visitorPlan->id]);
            }

            // Assign users to free member plan (25% of remaining users)
            $remainingUsers = $users->whereNotIn('id', $visitorUsers->pluck('id'));
            if ($remainingUsers->count() > 0) {
                $freeMemberUsers = $remainingUsers->random(min(ceil($remainingUsers->count() * 0.35), $remainingUsers->count()));
                foreach ($freeMemberUsers as $user) {
                    $user->update(['pricing_plan_id' => $freeMemberPlan->id]);
                }

                // Assign users to pro monthly plan (25% of remaining users)
                $stillRemaining = $remainingUsers->whereNotIn('id', $freeMemberUsers->pluck('id'));
                if ($stillRemaining->count() > 0) {
                    $proMonthlyUsers = $stillRemaining->random(min(ceil($stillRemaining->count() * 0.5), $stillRemaining->count()));
                    foreach ($proMonthlyUsers as $user) {
                        $user->update(['pricing_plan_id' => $proMonthlyPlan->id]);
                    }

                    // Assign users to pro yearly plan (15% of remaining users)
                    $finalRemaining = $stillRemaining->whereNotIn('id', $proMonthlyUsers->pluck('id'));
                    if ($finalRemaining->count() > 0) {
                        $proYearlyUsers = $finalRemaining->random(min(ceil($finalRemaining->count() * 0.7), $finalRemaining->count()));
                        foreach ($proYearlyUsers as $user) {
                            $user->update(['pricing_plan_id' => $proYearlyPlan->id]);
                        }

                        // Assign remaining users to lifetime plan
                        $lastRemaining = $finalRemaining->whereNotIn('id', $proYearlyUsers->pluck('id'));
                        foreach ($lastRemaining as $user) {
                            $user->update(['pricing_plan_id' => $lifetimePlan->id]);
                        }
                    }
                }
            }

            // Output user distribution
            $this->command->info('Pricing plans created successfully!');
            $this->command->info('Visitor Plan: ' . $visitorPlan->users()->count() . ' users');
            $this->command->info('Free Member Plan: ' . $freeMemberPlan->users()->count() . ' users');
            $this->command->info('Pro Monthly Plan: ' . $proMonthlyPlan->users()->count() . ' users');
            $this->command->info('Pro Yearly Plan: ' . $proYearlyPlan->users()->count() . ' users');
            $this->command->info('Lifetime Plan: ' . $lifetimePlan->users()->count() . ' users');
        } else {
            $this->command->info('Pricing plans created successfully! No users found to assign.');
        }
    }
}


