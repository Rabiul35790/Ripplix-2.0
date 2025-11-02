import { useState } from 'react';
import { PaymentData, PaymentInitiateResponse } from '../types/payment';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = async (pricingPlanId: number): Promise<PaymentInitiateResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pricing_plan_id: pricingPlanId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initiation failed');
            }

            const result: PaymentInitiateResponse = await response.json();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Payment failed';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        initiatePayment,
        loading,
        error,
        setError,
    };
};
