// Fixed PaymentModal with proper duplicate prevention
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentData, PaymentInitiateResponse } from '../types/payment';


interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentData: PaymentData;
    onSuccess: () => void;
}

const stripePromise = loadStripe('pk_live_51RCKo72LPf6CMtQj7zrBg48wCz8Cg3rXDqWLn4SDvUCn2m6lnutfJmNimewEbqfAFV4jwbykLpsUdmFtWYVrTXR200O99K8tC3');

const PaymentForm: React.FC<{
    paymentData: PaymentData;
    onSuccess: () => void;
    onClose: () => void;
}> = ({ paymentData, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Enhanced duplicate prevention
    const isProcessingRef = useRef(false);
    const processedPaymentIntentRef = useRef<string | null>(null);

    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();

        // Comprehensive duplicate check
        if (!stripe || !elements || loading || isProcessingRef.current || success) {
            console.log('Payment blocked:', {
                stripe: !!stripe,
                elements: !!elements,
                loading,
                isProcessing: isProcessingRef.current,
                success
            });
            return;
        }

        // Set processing flag immediately
        isProcessingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            // Step 1: Create payment intent
            const response = await fetch('/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pricing_plan_id: paymentData.pricing_plan_id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initiation failed');
            }

            const result: PaymentInitiateResponse = await response.json();

            if (!result.success) {
                throw new Error('Payment initiation failed');
            }

            if (result.gateway === 'stripe') {
                const clientSecret = result.data.client_secret!;

                // Check if we already processed this payment intent
                if (processedPaymentIntentRef.current === clientSecret) {
                    console.log('Payment intent already processed, skipping');
                    return;
                }

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    throw new Error('Card element not found');
                }

                // Step 2: Confirm payment with Stripe
                const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                    clientSecret,
                    {
                        payment_method: {
                            card: cardElement,
                        },
                    }
                );

                if (stripeError) {
                    throw new Error(stripeError.message || 'Payment failed');
                }

                if (paymentIntent?.status === 'succeeded') {
                    // Mark this payment intent as processed
                    processedPaymentIntentRef.current = clientSecret;

                    // Step 3: Confirm with backend (optional, depends on your webhook setup)
                    try {
                        await fetch('/payment/confirm', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                payment_intent_id: paymentIntent.id,
                                payment_id: result.payment_id,
                                transaction_id: result.transaction_id,
                            }),
                        });
                    } catch (confirmError) {
                        console.warn('Payment confirmation failed, but payment succeeded:', confirmError);
                        // Don't throw here as payment already succeeded with Stripe
                    }

                    setSuccess(true);

                    // Delay success callback to show success message
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                } else {
                    throw new Error('Payment was not completed successfully');
                }
            } else if (result.gateway === 'sslcommerz') {
                // For SSLCommerz, redirect immediately
                window.location.href = result.data.redirect_url!;
            } else {
                throw new Error('Unknown payment gateway');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setLoading(false);
            isProcessingRef.current = false;
        }
    }, [stripe, elements, loading, success, paymentData, onSuccess]);

    // Reset refs when component unmounts or modal closes
    React.useEffect(() => {
        if (!success) {
            processedPaymentIntentRef.current = null;
        }
    }, [success]);

    // Show success message
    if (success) {
        return (
            <div className="space-y-6 font-sora">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-green-900 mb-4">
                        <svg className="h-8 w-8 text-[#2B235A] dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#2B235A] dark:text-white mb-2">
                        Payment Successful!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Your payment of {paymentData.currency === 'USD' ? '$' : paymentData.currency}{paymentData.amount} has been processed successfully.
                    </p>
                    <div className="bg-[#F7F7FC] dark:bg-green-900 border border-[#E3E2FF] dark:border-green-700 rounded-lg p-4">
                        <p className="text-[#2B235A] dark:text-green-200 text-sm">
                            Redirecting you now...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[#2B235A] dark:text-white mb-2">
                    Payment Details
                </h3>
                <div className="bg-[#F5F5FA] dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                        <span className="font-semibold text-[#2B235A] dark:text-white">
                            {paymentData.plan_name}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                        <span className="font-bold text-lg text-[#2B235A] dark:text-white">
                            {paymentData.currency === 'USD' ? '$' : paymentData.currency}{paymentData.amount}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-[#2B235A] dark:text-gray-300 mb-2">
                    Card Information
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontFamily: 'Sora, sans-serif',
                                    fontSize: '16px',
                                    color: '#374151',
                                    '::placeholder': {
                                        color: '#9CA3AF',
                                    },
                                },
                                invalid: {
                                    color: '#EF4444',
                                },
                            },
                            hidePostalCode: true,
                        }}
                    />
                </div>

                {/* Test card info for development */}
                {/* <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-200 text-xs">
                        <strong>Test Mode:</strong> Use card 4242424242424242, any future expiry (e.g., 12/34), and any 3-digit CVC (e.g., 123)
                    </p>
                </div> */}
            </div>

            {error && (
                <div className="bg-[#F7F7FC] dark:bg-red-900 border border-[#E3E2FF] dark:border-red-700 rounded-lg p-4">
                    <p className="text-[#2B235A] dark:text-red-200 text-sm">{error}</p>
                </div>
            )}

            <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-white border border-[#E3E2FF] dark:border-gray-600 focus:outline-none focus:ring-0 rounded-md text-[#2B235A] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={loading || success}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading || isProcessingRef.current || success}
                    className="flex-1 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:opacity-90 focus:outline-none focus:ring-0  text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span>
                        {loading ? 'Processing...' : `Pay ${paymentData.currency === 'USD' ? '$' : paymentData.currency}${paymentData.amount}`}
                    </span>

                </button>
            </div>
        </form>
    );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, paymentData, onSuccess }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    // Reset modal state when closing
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            // Use capture phase to handle the event before it bubbles up
            document.addEventListener('mousedown', handleClickOutside, true);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside, true);
            };
        }
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4 font-sora"
            onClick={(e) => e.stopPropagation()}
        >
            <div ref={modalContentRef} className="bg-white border border-[#E0DDE9] dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-[#2B235A] dark:text-white">
                            Complete Payment
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-[#2B235A] hover:text-black bg-[#F5F5FA] rounded-sm dark:hover:text-gray-300 focus:outline-none focus:ring-0"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <Elements stripe={stripePromise}>
                        <PaymentForm
                            paymentData={paymentData}
                            onSuccess={onSuccess}
                            onClose={handleClose}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
