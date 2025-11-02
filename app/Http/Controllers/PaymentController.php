<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentGateway;
use App\Models\PricingPlan;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function initiate(Request $request)
    {
        $request->validate([
            'pricing_plan_id' => 'required|exists:pricing_plans,id',
        ]);

        if (!auth()->check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $pricingPlan = PricingPlan::findOrFail($request->pricing_plan_id);
        $gateway = PaymentGateway::getActiveGateway();

        if (!$gateway) {
            return response()->json(['error' => 'No active payment gateway found'], 400);
        }

        if ($pricingPlan->price == 0) {
            return response()->json(['error' => 'Cannot process payment for free plans'], 400);
        }

        $user = auth()->user();
        $userId = $user->id;

        try {
            DB::beginTransaction();

            // Check for existing pending payments
            $existingPayment = Payment::where('user_id', $userId)
                ->where('pricing_plan_id', $pricingPlan->id)
                ->whereIn('status', ['pending', 'processing'])
                ->where('created_at', '>', now()->subMinutes(10))
                ->lockForUpdate()
                ->first();

            if ($existingPayment) {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'payment_id' => $existingPayment->id,
                    'transaction_id' => $existingPayment->transaction_id,
                    'gateway' => $existingPayment->paymentGateway->slug,
                    'data' => json_decode($existingPayment->gateway_response, true) ?: []
                ]);
            }

            $transactionId = 'TXN_' . Str::upper(Str::random(10)) . '_' . time();

            // Auto-detect if this is a renewal
            $isRenewal = $user->pricing_plan_id === $pricingPlan->id &&
                        $user->plan_expires_at &&
                        $user->plan_expires_at->isFuture();

            // Create payment record
            $payment = Payment::create([
                'user_id' => $userId,
                'pricing_plan_id' => $pricingPlan->id,
                'payment_gateway_id' => $gateway->id,
                'transaction_id' => $transactionId,
                'amount' => $pricingPlan->price,
                'currency' => $pricingPlan->currency,
                'status' => 'pending',
                'is_renewal' => $isRenewal,
            ]);

            $paymentService = PaymentGatewayFactory::create($gateway);

            $paymentData = [
                'amount' => $pricingPlan->price,
                'currency' => $pricingPlan->currency,
                'transaction_id' => $transactionId,
                'user_id' => $userId,
                'pricing_plan_id' => $pricingPlan->id,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'product_name' => $pricingPlan->name . ' Plan' . ($isRenewal ? ' (Renewal)' : ''),
            ];

            $result = $paymentService->createPayment($paymentData);

            if ($result['success']) {
                $payment->update([
                    'gateway_response' => json_encode($result),
                    'gateway_transaction_id' => $result['payment_intent_id'] ?? $result['session_id'] ?? null,
                ]);

                DB::commit();

                Log::info("Payment initiated: {$payment->id} for user {$userId}, plan {$pricingPlan->slug}, renewal: " . ($isRenewal ? 'yes' : 'no'));

                return response()->json([
                    'success' => true,
                    'payment_id' => $payment->id,
                    'transaction_id' => $transactionId,
                    'gateway' => $gateway->slug,
                    'data' => $result
                ]);
            }

            $payment->update(['status' => 'failed']);
            DB::commit();

            return response()->json(['error' => $result['error']], 400);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment initiation failed: ' . $e->getMessage(), [
                'user_id' => $userId,
                'pricing_plan_id' => $pricingPlan->id,
            ]);

            return response()->json(['error' => 'Payment initiation failed. Please try again.'], 500);
        }
    }

    public function confirm(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'payment_id' => 'required|exists:payments,id',
            'transaction_id' => 'required|string',
        ]);

        if (!auth()->check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        try {
            DB::beginTransaction();

            $payment = Payment::where('id', $request->payment_id)
                ->where('transaction_id', $request->transaction_id)
                ->where('user_id', auth()->id())
                ->with(['user', 'pricingPlan'])
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            if ($payment->status === 'completed') {
                DB::commit();
                return response()->json(['success' => true, 'message' => 'Payment already completed']);
            }

            // Mark as completed automatically with user subscription update
            $payment->markAsCompleted($request->payment_intent_id);

            DB::commit();

            Log::info("Payment confirmed and completed: {$payment->id}");

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment confirmation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Payment confirmation failed'], 500);
        }
    }

    public function success(Request $request)
    {
        if ($request->has('tran_id')) {
            try {
                DB::beginTransaction();

                $payment = Payment::where('transaction_id', $request->tran_id)
                    ->with(['user', 'pricingPlan', 'paymentGateway'])
                    ->lockForUpdate()
                    ->first();

                if ($payment && $payment->paymentGateway->slug === 'sslcommerz') {
                    if ($payment->status === 'completed') {
                        DB::commit();
                        return redirect('/')->with('success', 'Payment already completed!');
                    }

                    $paymentService = PaymentGatewayFactory::create($payment->paymentGateway);

                    if ($paymentService->verifyPayment($request->val_id)) {
                        // Automatically complete payment and update user subscription
                        $payment->markAsCompleted($request->val_id, $request->all());

                        DB::commit();

                        Log::info("SSLCommerz payment completed: {$payment->id}");

                        return redirect('/')->with('success', 'Payment completed successfully!');
                    }
                }

                DB::rollBack();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('SSLCommerz success handler failed: ' . $e->getMessage());
            }
        }

        return redirect('/')->with('error', 'Payment verification failed.');
    }

    public function fail(Request $request)
    {
        if ($request->has('tran_id')) {
            try {
                $payment = Payment::where('transaction_id', $request->tran_id)->first();
                if ($payment && $payment->status !== 'failed') {
                    $payment->update([
                        'status' => 'failed',
                        'gateway_response' => json_encode($request->all())
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Payment fail handler error: ' . $e->getMessage());
            }
        }

        return redirect('/')->with('error', 'Payment failed.');
    }

    public function cancel(Request $request)
    {
        if ($request->has('tran_id')) {
            try {
                $payment = Payment::where('transaction_id', $request->tran_id)->first();
                if ($payment && $payment->status !== 'cancelled') {
                    $payment->update([
                        'status' => 'cancelled',
                        'gateway_response' => json_encode($request->all())
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Payment cancel handler error: ' . $e->getMessage());
            }
        }

        return redirect('/')->with('info', 'Payment cancelled.');
    }

    public function webhook(Request $request)
    {
        $gateway = PaymentGateway::getActiveGateway();

        if ($gateway && $gateway->slug === 'stripe') {
            try {
                $paymentService = PaymentGatewayFactory::create($gateway);
                $result = $paymentService->handleWebhook($request->all());

                if (isset($result['payment_intent_id'])) {
                    $this->processStripeWebhook($result);
                }

            } catch (\Exception $e) {
                Log::error('Stripe webhook processing failed: ' . $e->getMessage());
                return response()->json(['error' => 'Webhook processing failed'], 500);
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function processStripeWebhook($webhookData)
    {
        try {
            DB::beginTransaction();

            $payment = Payment::where('gateway_transaction_id', $webhookData['payment_intent_id'])
                ->with(['user', 'pricingPlan'])
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                Log::warning("Payment not found for webhook: {$webhookData['payment_intent_id']}");
                DB::commit();
                return;
            }

            if ($payment->status !== 'completed' && $webhookData['status'] === 'succeeded') {
                // Automatically complete payment and update user subscription
                $payment->markAsCompleted($webhookData['payment_intent_id'], $webhookData);

                Log::info("Stripe webhook processed and payment completed: {$payment->id}");
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stripe webhook processing error: ' . $e->getMessage());
        }
    }
}
