<?php
// app/Providers/PaymentGatewayServiceProvider.php

namespace App\Providers;

use App\Models\PaymentGateway;
use App\Services\PaymentGatewayService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;

class PaymentGatewayServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(PaymentGatewayService::class, function ($app) {
            return new PaymentGatewayService();
        });

        // Register gateway-specific services
        $this->registerGatewayServices();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Bind default gateway to container
        $this->app->bind('payment.gateway.default', function () {
            return Cache::remember('default_payment_gateway', 3600, function () {
                return PaymentGateway::getDefaultGateway();
            });
        });

        // Clear cache when gateways are updated
        PaymentGateway::saved(function () {
            Cache::forget('default_payment_gateway');
            Cache::forget('active_payment_gateways');
        });

        PaymentGateway::deleted(function () {
            Cache::forget('default_payment_gateway');
            Cache::forget('active_payment_gateways');
        });
    }

    /**
     * Register gateway-specific services
     */
    private function registerGatewayServices(): void
    {
        // Register Stripe service
        $this->app->bind('payment.gateway.stripe', function ($app) {
            return new \App\Services\Gateways\StripeGatewayService();
        });

        // Register PayPal service
        // $this->app->bind('payment.gateway.paypal', function ($app) {
        //     return new \App\Services\Gateways\PayPalGatewayService();
        // });

        // // Register Razorpay service
        // $this->app->bind('payment.gateway.razorpay', function ($app) {
        //     return new \App\Services\Gateways\RazorpayGatewayService();
        // });

        // Add more gateway services as needed
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [
            PaymentGatewayService::class,
            'payment.gateway.default',
            'payment.gateway.stripe',
            // 'payment.gateway.paypal',
            // 'payment.gateway.razorpay',
        ];
    }
}
