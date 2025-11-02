<?php
namespace App\Services\Payment;

use App\Models\Payment;

interface PaymentGatewayInterface
{
    public function createPayment(array $data): array;
    public function verifyPayment(string $transactionId): bool;
    public function handleWebhook(array $payload): void;
}
