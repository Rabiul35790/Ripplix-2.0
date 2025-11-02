<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class HandleExpiredSubscriptionsCommand extends Command
{
    protected $signature = 'subscriptions:handle-expired {--notify : Send expiry notifications}';
    protected $description = 'Handle expired user subscriptions and downgrade to free member plan';

    public function __construct(
        private SubscriptionService $subscriptionService
    ) {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Checking for expired subscriptions...');

        // Get analytics before processing
        $analytics = $this->subscriptionService->getSubscriptionAnalytics();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Active Subscriptions', $analytics['total_active_subscriptions']],
                ['Expiring Soon (7 days)', $analytics['expiring_soon']],
                ['Expired Pending Downgrade', $analytics['expired_pending_downgrade']],
                ['Monthly Subscribers', $analytics['monthly_subscribers']],
                ['Yearly Subscribers', $analytics['yearly_subscribers']],
                ['Lifetime Subscribers', $analytics['lifetime_subscribers']],
                ['Free Members', $analytics['free_members']],
            ]
        );

        if ($analytics['expired_pending_downgrade'] === 0) {
            $this->info('No expired subscriptions found.');
            return 0;
        }

        // Handle expired subscriptions
        $this->info("Processing {$analytics['expired_pending_downgrade']} expired subscriptions...");

        $results = $this->subscriptionService->handleAllExpiredSubscriptions();

        $this->newLine();
        $this->info("Subscription processing completed:");
        $this->line("✓ Total processed: {$results['total']}");
        $this->line("✓ Successfully downgraded: {$results['downgraded']}");

        if ($results['failed'] > 0) {
            $this->error("✗ Failed: {$results['failed']}");
        }

        // Send expiry notifications if requested
        if ($this->option('notify')) {
            $this->info('Sending expiry notifications...');
            $notificationResults = $this->subscriptionService->sendExpiryNotifications();
            $this->line("✓ Notifications sent: {$notificationResults['sent']}");
            if ($notificationResults['failed'] > 0) {
                $this->error("✗ Notification failures: {$notificationResults['failed']}");
            }
        }

        // Show MRR
        $mrr = $this->subscriptionService->calculateMRR();
        $this->info("Current MRR: $" . number_format($mrr, 2));

        return 0;
    }
}
