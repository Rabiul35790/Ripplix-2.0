<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\PaymentGateway;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripePaymentGateway implements PaymentGatewayInterface
{
    private PaymentGateway $gateway;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
        Stripe::setApiKey($gateway->secret_key);
    }

    public function createPayment(array $data): array
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $data['amount'] * 100, // Convert to cents
                'currency' => strtolower($data['currency']),
                'metadata' => [
                    'user_id' => $data['user_id'],
                    'pricing_plan_id' => $data['pricing_plan_id'],
                    'transaction_id' => $data['transaction_id']
                ]
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function verifyPayment(string $transactionId): bool
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($transactionId);
            return $paymentIntent->status === 'succeeded';
        } catch (\Exception $e) {
            return false;
        }
    }

    public function handleWebhook(array $payload): void
    {
        if ($payload['type'] === 'payment_intent.succeeded') {
            $paymentIntent = $payload['data']['object'];
            $metadata = $paymentIntent['metadata'];

            $payment = Payment::where('transaction_id', $metadata['transaction_id'])->first();
            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'gateway_transaction_id' => $paymentIntent['id'],
                    'paid_at' => now(),
                    'gateway_response' => $paymentIntent
                ]);

                // Update user's pricing plan
                $payment->user->update(['pricing_plan_id' => $payment->pricing_plan_id]);
            }
        }
    }
}
