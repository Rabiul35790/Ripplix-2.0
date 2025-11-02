<?php
// app/Traits/HasGatewayConfiguration.php

namespace App\Traits;

use App\Models\PaymentGateway;
use Illuminate\Support\Collection;

trait HasGatewayConfiguration
{
    /**
     * Get the payment gateway relationship
     */
    public function paymentGateway()
    {
        return $this->belongsTo(PaymentGateway::class);
    }

    /**
     * Get all available payment gateways
     */
    public function getAvailableGateways(): Collection
    {
        return PaymentGateway::active()->ordered()->get();
    }

    /**
     * Get the default payment gateway
     */
    public function getDefaultGateway(): ?PaymentGateway
    {
        return PaymentGateway::getDefaultGateway();
    }

    /**
     * Get gateways for a specific currency
     */
    public function getGatewaysForCurrency(string $currency): Collection
    {
        return PaymentGateway::active()
            ->get()
            ->filter(fn($gateway) => $gateway->supportsCurrency($currency));
    }

    /**
     * Get gateways for a specific country
     */
    public function getGatewaysForCountry(string $country): Collection
    {
        return PaymentGateway::active()
            ->get()
            ->filter(fn($gateway) => $gateway->supportsCountry($country));
    }

    /**
     * Get gateways by provider
     */
    public function getGatewaysByProvider(string $provider): Collection
    {
        return PaymentGateway::active()
            ->byProvider($provider)
            ->ordered()
            ->get();
    }

    /**
     * Get production gateways only
     */
    public function getProductionGateways(): Collection
    {
        return PaymentGateway::active()
            ->production()
            ->ordered()
            ->get();
    }

    /**
     * Get gateway configuration for frontend
     */
    public function getGatewayConfigForFrontend(PaymentGateway $gateway): array
    {
        $config = [
            'id' => $gateway->id,
            'name' => $gateway->name,
            'provider' => $gateway->provider,
            'environment' => $gateway->environment,
            'supported_currencies' => $gateway->supported_currencies ?? [],
            'supported_countries' => $gateway->supported_countries ?? [],
        ];

        // Add provider-specific public configuration
        switch ($gateway->provider) {
            case 'stripe':
                $config['publishable_key'] = $gateway->getCredential('publishable_key');
                break;
            case 'razorpay':
                $config['key_id'] = $gateway->getCredential('key_id');
                break;
            case 'square':
                $config['application_id'] = $gateway->getCredential('application_id');
                $config['location_id'] = $gateway->getCredential('location_id');
                break;
        }

        return $config;
    }

    /**
     * Calculate total fees for an amount across all gateways
     */
    public function compareGatewayFees(float $amount): Collection
    {
        return $this->getAvailableGateways()->map(function ($gateway) use ($amount) {
            $feeCalculation = $gateway->calculateFee($amount);

            return [
                'gateway' => $gateway,
                'total_fee' => $feeCalculation['total_fee'],
                'net_amount' => $feeCalculation['net_amount'],
                'fee_breakdown' => $feeCalculation,
            ];
        })->sortBy('total_fee');
    }

    /**
     * Get the best gateway for an amount (lowest fees)
     */
    public function getBestGatewayForAmount(float $amount, string $currency = 'USD'): ?PaymentGateway
    {
        return $this->getGatewaysForCurrency($currency)
            ->sortBy(function ($gateway) use ($amount) {
                return $gateway->calculateFee($amount)['total_fee'];
            })
            ->first();
    }

    /**
     * Check if any gateway supports a specific feature
     */
    public function hasGatewayWithFeature(string $feature): bool
    {
        return $this->getAvailableGateways()
            ->contains(function ($gateway) use ($feature) {
                return $gateway->getConfiguration($feature, false) === true;
            });
    }

    /**
     * Get gateways that support a specific feature
     */
    public function getGatewaysWithFeature(string $feature): Collection
    {
        return $this->getAvailableGateways()
            ->filter(function ($gateway) use ($feature) {
                return $gateway->getConfiguration($feature, false) === true;
            });
    }

    /**
     * Validate gateway credentials format
     */
    public function validateGatewayCredentials(PaymentGateway $gateway): array
    {
        $errors = [];
        $requiredFields = PaymentGateway::getProviderFields($gateway->provider);

        foreach ($requiredFields as $field => $label) {
            if (empty($gateway->getCredential($field))) {
                $errors[$field] = "The {$label} field is required.";
            }
        }

        return $errors;
    }

    /**
     * Get gateway webhook URL for a specific gateway
     */
    public function getWebhookUrl(PaymentGateway $gateway): string
    {
        return route('webhooks.payment.gateway', [
            'gateway' => $gateway->slug
        ]);
    }

    /**
     * Format currency amount for display
     */
    public function formatCurrencyAmount(float $amount, string $currency = 'USD'): string
    {
        $formatter = new \NumberFormatter('en_US', \NumberFormatter::CURRENCY);
        return $formatter->formatCurrency($amount, $currency);
    }

    /**
     * Get supported payment methods for active gateways
     */
    public function getSupportedPaymentMethods(): array
    {
        $methods = [];

        foreach ($this->getAvailableGateways() as $gateway) {
            switch ($gateway->provider) {
                case 'stripe':
                    $methods[] = ['type' => 'card', 'gateway' => $gateway->name];
                    $methods[] = ['type' => 'apple_pay', 'gateway' => $gateway->name];
                    $methods[] = ['type' => 'google_pay', 'gateway' => $gateway->name];
                    break;
                case 'paypal':
                    $methods[] = ['type' => 'paypal', 'gateway' => $gateway->name];
                    break;
                case 'razorpay':
                    $methods[] = ['type' => 'card', 'gateway' => $gateway->name];
                    $methods[] = ['type' => 'upi', 'gateway' => $gateway->name];
                    $methods[] = ['type' => 'netbanking', 'gateway' => $gateway->name];
                    break;
            }
        }

        return collect($methods)->unique('type')->values()->toArray();
    }

    /**
     * Get gateway statistics
     */
    public function getGatewayStats(): array
    {
        $gateways = $this->getAvailableGateways();

        return [
            'total_active' => $gateways->count(),
            'production_count' => $gateways->where('environment', 'production')->count(),
            'sandbox_count' => $gateways->where('environment', 'sandbox')->count(),
            'providers' => $gateways->pluck('provider')->unique()->values()->toArray(),
            'has_default' => $gateways->where('is_default', true)->count() > 0,
            'currencies_supported' => $gateways->pluck('supported_currencies')
                ->filter()
                ->flatten()
                ->unique()
                ->values()
                ->toArray(),
        ];
    }
}
