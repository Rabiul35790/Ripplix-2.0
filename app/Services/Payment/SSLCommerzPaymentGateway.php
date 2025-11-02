<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\PaymentGateway;
use Illuminate\Support\Facades\Http;

class SSLCommerzPaymentGateway implements PaymentGatewayInterface
{
    private PaymentGateway $gateway;
    private string $baseUrl;

    public function __construct(PaymentGateway $gateway)
    {
        $this->gateway = $gateway;
        $this->baseUrl = $gateway->mode === 'live'
            ? 'https://securepay.sslcommerz.com'
            : 'https://sandbox.sslcommerz.com';
    }

    public function createPayment(array $data): array
    {
        try {
            $postData = [
                'store_id' => $this->gateway->publishable_key,
                'store_passwd' => $this->gateway->secret_key,
                'total_amount' => $data['amount'],
                'currency' => $data['currency'],
                'tran_id' => $data['transaction_id'],
                'success_url' => route('payment.success'),
                'fail_url' => route('payment.fail'),
                'cancel_url' => route('payment.cancel'),
                'cus_name' => $data['customer_name'],
                'cus_email' => $data['customer_email'],
                'cus_phone' => $data['customer_phone'] ?? '01700000000',
                'cus_add1' => 'Dhaka',
                'cus_city' => 'Dhaka',
                'cus_country' => 'Bangladesh',
                'product_name' => $data['product_name'],
                'product_category' => 'Subscription',
                'product_profile' => 'general',
            ];

            $response = Http::post($this->baseUrl . '/gwprocess/v4/api.php', $postData);
            $result = $response->json();

            if ($result['status'] === 'SUCCESS') {
                return [
                    'success' => true,
                    'redirect_url' => $result['GatewayPageURL']
                ];
            }

            return [
                'success' => false,
                'error' => $result['failedreason'] ?? 'Payment initialization failed'
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
            $response = Http::get($this->baseUrl . '/validator/api/validationserverAPI.php', [
                'val_id' => $transactionId,
                'store_id' => $this->gateway->publishable_key,
                'store_passwd' => $this->gateway->secret_key,
                'format' => 'json'
            ]);

            $result = $response->json();
            return $result['status'] === 'VALID';
        } catch (\Exception $e) {
            return false;
        }
    }

    public function handleWebhook(array $payload): void
    {
        // SSLCommerz doesn't use webhooks in the traditional sense
        // Payment verification is done via IPN or redirect URLs
    }
}
