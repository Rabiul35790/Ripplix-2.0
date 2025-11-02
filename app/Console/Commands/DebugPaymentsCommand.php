<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Console\Command;

class DebugPaymentsCommand extends Command
{
    protected $signature = 'payments:debug {user_id?}';
    protected $description = 'Debug payment and subscription issues';

    public function handle()
    {
        $userId = $this->argument('user_id');

        if ($userId) {
            $this->debugUserPayments($userId);
        } else {
            $this->debugRecentPayments();
        }

        return 0;
    }

    private function debugUserPayments($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            $this->error("User {$userId} not found");
            return;
        }

        $this->info("=== User {$userId} Debug Info ===");
        $this->line("Name: {$user->name}");
        $this->line("Email: {$user->email}");
        $this->line("Current Plan ID: {$user->pricing_plan_id}");
        $this->line("Plan Updated: {$user->plan_updated_at}");
        $this->line("Plan Expires: {$user->plan_expires_at}");

        if ($user->pricingPlan) {
            $this->line("Current Plan: {$user->pricingPlan->name} ({$user->pricingPlan->slug})");
        } else {
            $this->error("No pricing plan assigned!");
        }

        $this->newLine();
        $this->info("=== Recent Payments ===");

        $payments = Payment::forUser($userId)
            ->with(['pricingPlan', 'paymentGateway'])
            ->latest()
            ->limit(10)
            ->get();

        if ($payments->isEmpty()) {
            $this->warn("No payments found for this user");
            return;
        }

        $this->table(
            ['ID', 'Plan', 'Amount', 'Status', 'Gateway', 'Paid At', 'Created'],
            $payments->map(function ($payment) {
                return [
                    $payment->id,
                    $payment->pricingPlan->name ?? 'N/A',
                    $payment->formatted_amount,
                    $payment->status,
                    $payment->paymentGateway->slug ?? 'N/A',
                    $payment->paid_at ? $payment->paid_at->format('Y-m-d H:i') : 'Not paid',
                    $payment->created_at->format('Y-m-d H:i'),
                ];
            })
        );

        // Check for completed payments that didn't update user plan
        $completedPayments = $payments->where('status', 'completed');
        if ($completedPayments->isNotEmpty()) {
            $this->newLine();
            $this->info("=== Completed Payments Analysis ===");

            foreach ($completedPayments as $payment) {
                $shouldHavePlan = $payment->pricingPlan->id;
                $currentPlan = $user->pricing_plan_id;

                if ($shouldHavePlan != $currentPlan) {
                    $this->warn("Payment {$payment->id} completed but user plan not updated!");
                    $this->line("  Expected Plan: {$shouldHavePlan} ({$payment->pricingPlan->name})");
                    $this->line("  Current Plan: {$currentPlan}");
                    $this->line("  Payment Date: {$payment->paid_at}");

                    // Offer to fix it
                    if ($this->confirm("Fix this payment? This will update the user's plan.")) {
                        $user->upgradeSubscription($payment->pricingPlan);
                        $this->info("✓ User plan updated to {$payment->pricingPlan->name}");
                    }
                }
            }
        }
    }

    private function debugRecentPayments()
    {
        $this->info("=== Recent Payments Debug ===");

        $recentPayments = Payment::with(['user', 'pricingPlan', 'paymentGateway'])
            ->where('created_at', '>', now()->subHours(24))
            ->latest()
            ->get();

        if ($recentPayments->isEmpty()) {
            $this->warn("No payments in the last 24 hours");
            return;
        }

        $this->table(
            ['ID', 'User', 'Plan', 'Amount', 'Status', 'User Plan Updated?', 'Created'],
            $recentPayments->map(function ($payment) {
                $userPlanMatch = $payment->user->pricing_plan_id == $payment->pricing_plan_id;
                return [
                    $payment->id,
                    $payment->user->name,
                    $payment->pricingPlan->name ?? 'N/A',
                    $payment->formatted_amount,
                    $payment->status,
                    $payment->status === 'completed' ? ($userPlanMatch ? '✓ Yes' : '✗ No') : '-',
                    $payment->created_at->format('Y-m-d H:i'),
                ];
            })
        );

        // Show issues
        $issues = $recentPayments->filter(function ($payment) {
            return $payment->status === 'completed' &&
                   $payment->user->pricing_plan_id != $payment->pricing_plan_id;
        });

        if ($issues->isNotEmpty()) {
            $this->newLine();
            $this->error("Found {$issues->count()} completed payments where user plan wasn't updated!");

            if ($this->confirm('Fix all these issues?')) {
                foreach ($issues as $payment) {
                    $payment->user->upgradeSubscription($payment->pricingPlan);
                    $this->info("✓ Fixed payment {$payment->id} for user {$payment->user->name}");
                }
            }
        } else {
            $this->info("✓ All completed payments have correct user plans");
        }
    }
}
