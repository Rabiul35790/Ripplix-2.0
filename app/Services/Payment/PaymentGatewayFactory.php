<?php
namespace App\Services\Payment;

use App\Models\PaymentGateway;

class PaymentGatewayFactory
{
    public static function create(PaymentGateway $gateway): PaymentGatewayInterface
    {
        return match ($gateway->slug) {
            'stripe' => new StripePaymentGateway($gateway),
            'sslcommerz' => new SSLCommerzPaymentGateway($gateway),
            default => throw new \InvalidArgumentException("Unsupported payment gateway: {$gateway->slug}")
        };
    }
}
