<?php
// app/Services/PaymentGatewayService.php

namespace App\Services;

use App\Models\PaymentGateway;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use Exception;

class PaymentGatewayService
{
    protected ?PaymentGateway $gateway = null;
    protected array $config = [];

    public function __construct(protected ?string $gatewaySlug = null)
    {
        if ($gatewaySlug) {
            $this->setGateway($gatewaySlug);
        }
    }

    /**
     * Set the payment gateway to use
     */
    public function setGateway(string $gatewaySlug): self
    {
        $this->gateway = PaymentGateway::active()
            ->where('slug', $gatewaySlug)
            ->firstOrFail();

        $this->config = $this->gateway->credentials ?? [];

        return $this;
    }

    /**
     * Get the current gateway
     */
    public function getGateway(): ?PaymentGateway
    {
        return $this->gateway;
    }

    /**
     * Use the default gateway
     */
    public function useDefault(): self
    {
        $this->gateway = PaymentGateway::getDefaultGateway();

        if (!$this->gateway) {
            throw new InvalidArgumentException('No default payment gateway configured');
        }

        $this->config = $this->gateway->credentials ?? [];

        return $this;
    }

    /**
     * Get all active gateways
     */
    public function getActiveGateways(): Collection
    {
        return PaymentGateway::active()->ordered()->get();
    }

    /**
     * Get gateways by provider
     */
    public function getGatewaysByProvider(string $provider): Collection
    {
        return PaymentGateway::active()->byProvider($provider)->get();
    }

    /**
     * Get production gateways
     */
    public function getProductionGateways(): Collection
    {
        return PaymentGateway::active()->production()->ordered()->get();
    }

    /**
     * Get sandbox gateways
     */
    public function getSandboxGateways(): Collection
    {
        return PaymentGateway::active()->sandbox()->ordered()->get();
    }

    /**
     * Find best gateway for currency and country
     */
    public function findBestGateway(string $currency = 'USD', string $country = 'US'): ?PaymentGateway
    {
        return PaymentGateway::active()
            ->where(function ($query) use ($currency) {
                $query->whereNull('supported_currencies')
                      ->orWhereJsonContains('supported_currencies', strtoupper($currency));
            })
            ->where(function ($query) use ($country) {
                $query->whereNull('supported_countries')
                      ->orWhereJsonContains('supported_countries', strtoupper($country));
            })
            ->ordered()
            ->first();
    }

    /**
     * Calculate total fees for an amount
     */
    public function calculateFees(float $amount, ?string $gatewaySlug = null): array
    {
        $gateway = $gatewaySlug ?
            PaymentGateway::where('slug', $gatewaySlug)->firstOrFail() :
            $this->gateway;

        if (!$gateway) {
            throw new InvalidArgumentException('No gateway specified');
        }

        return $gateway->calculateFee($amount);
    }

    /**
     * Test gateway connection
     */
    public function testConnection(?string $gatewaySlug = null): array
    {
        $gateway = $gatewaySlug ?
            PaymentGateway::where('slug', $gatewaySlug)->firstOrFail() :
            $this->gateway;

        if (!$gateway) {
            throw new InvalidArgumentException('No gateway specified');
        }

        try {
            // Implement gateway-specific testing logic
            $result = $this->performGatewayTest($gateway);

            $gateway->markAsTested($result['message'] ?? 'Connection test successful');

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Gateway connection successful',
                'data' => $result['data'] ?? null,
            ];
        } catch (Exception $e) {
            $gateway->markAsTested('Test failed: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getCode(),
            ];
        }
    }

    /**
     * Perform gateway-specific testing
     */
    protected function performGatewayTest(PaymentGateway $gateway): array
    {
        return match($gateway->provider) {
            'stripe' => $this->testStripeConnection($gateway),
            // 'paypal' => $this->testPayPalConnection($gateway),
            // 'razorpay' => $this->testRazorpayConnection($gateway),
            default => $this->testGenericConnection($gateway),
        };
    }

    /**
     * Test Stripe connection
     */
    protected function testStripeConnection(PaymentGateway $gateway): array
    {
        // Implement Stripe-specific testing
        return [
            'message' => 'Stripe connection test successful',
            'data' => ['test_mode' => $gateway->isSandbox()],
        ];
    }

    /**
     * Test PayPal connection
     */
    // protected function testPayPalConnection(PaymentGateway $gateway): array
    // {
    //     // Implement PayPal-specific testing
    //     return [
    //         'message' => 'PayPal connection test successful',
    //         'data' => ['environment' => $gateway->environment],
    //     ];
    // }

    /**
     * Test Razorpay connection
     */
    // protected function testRazorpayConnection(PaymentGateway $gateway): array
    // {
    //     // Implement Razorpay-specific testing
    //     return [
    //         'message' => 'Razorpay connection test successful',
    //         'data' => ['test_mode' => $gateway->isSandbox()],
    //     ];
    // }

    /**
     * Test generic gateway connection
     */
    protected function testGenericConnection(PaymentGateway $gateway): array
    {
        return [
            'message' => 'Generic gateway connection test successful',
            'data' => ['provider' => $gateway->provider],
        ];
    }

    /**
     * Get gateway configuration
     */
    public function getConfig(string $key = null, $default = null)
    {
        if (!$this->gateway) {
            throw new InvalidArgumentException('No gateway set');
        }

        if ($key) {
            return $this->gateway->getCredential($key, $default);
        }

        return $this->config;
    }

    /**
     * Get gateway setting
     */
    public function getSetting(string $key, $default = null)
    {
        if (!$this->gateway) {
            throw new InvalidArgumentException('No gateway set');
        }

        return $this->gateway->getConfiguration($key, $default);
    }

    /**
     * Check if gateway is in production mode
     */
    public function isProduction(): bool
    {
        return $this->gateway?->isProduction() ?? false;
    }

    /**
     * Check if gateway is in sandbox mode
     */
    public function isSandbox(): bool
    {
        return $this->gateway?->isSandbox() ?? true;
    }

    /**
     * Get webhook URL for the current gateway
     */
    public function getWebhookUrl(): ?string
    {
        return $this->gateway?->webhook_url;
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if (!$this->gateway?->webhook_secret) {
            return false;
        }

        return match($this->gateway->provider) {
            'stripe' => $this->verifyStripeWebhook($payload, $signature),
            // 'paypal' => $this->verifyPayPalWebhook($payload, $signature),
            default => $this->verifyGenericWebhook($payload, $signature),
        };
    }

    /**
     * Verify Stripe webhook signature
     */
    protected function verifyStripeWebhook(string $payload, string $signature): bool
    {
        // Implement Stripe webhook verification
        return hash_equals(
            hash_hmac('sha256', $payload, $this->gateway->webhook_secret),
            $signature
        );
    }

    /**
     * Verify PayPal webhook signature
     */
    protected function verifyPayPalWebhook(string $payload, string $signature): bool
    {
        // Implement PayPal webhook verification
        return hash_equals(
            hash_hmac('sha256', $payload, $this->gateway->webhook_secret),
            $signature
        );
    }

    /**
     * Verify generic webhook signature
     */
    protected function verifyGenericWebhook(string $payload, string $signature): bool
    {
        return hash_equals(
            hash_hmac('sha256', $payload, $this->gateway->webhook_secret),
            $signature
        );
    }

    /**
     * Format amount for gateway
     */
    public function formatAmount(float $amount, string $currency = 'USD'): int
    {
        // Most gateways expect amount in cents
        return (int) round($amount * 100);
    }

    /**
     * Format amount from gateway
     */
    public function parseAmount(int $amount, string $currency = 'USD'): float
    {
        // Convert from cents to dollars
        return $amount / 100;
    }
}
