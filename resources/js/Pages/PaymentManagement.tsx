import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogLayout from './BlogLayout';
import axios from 'axios';
import {
    CreditCard,
    Download,
    Trash2,
    Plus,
    Check,
    X,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethod {
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
}

interface Invoice {
    id: string;
    date: string;
    total: string;
    status: string;
    invoice_pdf: string;
}

interface SubscriptionData {
    subscription_plan: {
        id: number;
        name: string;
        price: number;
        billing_period: string;
    } | null;
    has_active_subscription: boolean;
    auto_renew: boolean;
    payment_method: PaymentMethod | null;
    stripe_subscription?: {
        status: string;
        ends_at: string | null;
        trial_ends_at: string | null;
        on_grace_period: boolean;
        cancelled: boolean;
    };
}

interface PaymentManagementProps extends PageProps {
    userPlanLimits?: any;
    currentPlan?: any;
    settings?: {
        logo?: string;
        copyright_text?: string;
        site_name?: string;
    };
    filters?: any;
}

// Add Payment Method Form Component
const AddPaymentMethodForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({
    onSuccess,
    onCancel,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe not loaded');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Step 1: Creating setup intent...');
            const { data } = await axios.post('/api/subscription/payment-method/setup');

            if (!data.success || !data.client_secret) {
                throw new Error('Failed to create setup intent');
            }

            console.log('Step 2: Confirming card with Stripe...');
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
                data.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message || 'Failed to add payment method');
            }

            if (setupIntent && setupIntent.status === 'succeeded') {
                console.log('Step 3: Card confirmed, updating backend...');

                // Wait a bit for Stripe webhook to process
                await new Promise(resolve => setTimeout(resolve, 2000));

                const updateResponse = await axios.post('/api/subscription/payment-method/update');

                if (updateResponse.data.success) {
                    console.log('Step 4: Payment method saved successfully!');
                    onSuccess();
                } else {
                    throw new Error('Failed to save payment method info');
                }
            } else {
                throw new Error('Payment method setup failed');
            }

        } catch (error: any) {
            console.error('Error in payment method flow:', error);
            setError(error.message || 'Failed to add payment method');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-gray-300 rounded-lg bg-white">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                                fontFamily: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                        hidePostalCode: false,
                    }}
                />
            </div>

            {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sora"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors font-sora"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Add Payment Method'
                    )}
                </button>
            </div>
        </form>
    );
};

const PaymentManagement: React.FC<PaymentManagementProps> = ({
    userPlanLimits,
    currentPlan,
    settings,
    filters,
    auth
}) => {
    const { props } = usePage<PageProps>();
    const authData = auth || props.auth;
    const ziggyData = props.ziggy;

    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddCard, setShowAddCard] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subResponse, invoicesResponse] = await Promise.all([
                axios.get('/api/subscription/current'),
                axios.get('/api/subscription/invoices'),
            ]);

            if (subResponse.data.success) {
                console.log('Subscription data:', subResponse.data);
                setSubscriptionData(subResponse.data);
            }

            if (invoicesResponse.data.success) {
                setInvoices(invoicesResponse.data.invoices);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMessage('Failed to load payment information');
        } finally {
            setLoading(false);
        }
    };

    const isLifetimePlan = (): boolean => {
        return subscriptionData?.subscription_plan?.billing_period === 'lifetime';
    };

    const isFreePlan = (): boolean => {
        return !subscriptionData?.subscription_plan || subscriptionData.subscription_plan.price === 0;
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
            return;
        }

        setActionLoading('cancel');
        try {
            const response = await axios.post('/api/subscription/cancel');

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                await fetchData();
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to cancel subscription');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResumeSubscription = async () => {
        setActionLoading('resume');
        try {
            const response = await axios.post('/api/subscription/resume');

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                await fetchData();
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to resume subscription');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemovePaymentMethod = async () => {
        if (!confirm('Are you sure you want to remove your payment method?')) {
            return;
        }

        setActionLoading('remove_card');
        try {
            const response = await axios.delete('/api/subscription/payment-method');

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                await fetchData();
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to remove payment method');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddCardSuccess = async () => {
        console.log('Card added successfully, refreshing data...');
        setShowAddCard(false);
        setSuccessMessage('Payment method added successfully');

        // Wait for Stripe to sync before refreshing
        setTimeout(async () => {
            await fetchData();
        }, 2000);
    };

    if (loading) {
        return (
            <>
                <Head title="Payment Management" />
                <BlogLayout
                    settings={settings}
                    filters={filters}
                    currentPlan={currentPlan}
                    userPlanLimits={userPlanLimits}
                    auth={authData}
                    ziggy={ziggyData}
                >
                    <div className="flex items-center justify-center min-h-screen bg-gray-50">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                </BlogLayout>
            </>
        );
    }

    console.log("payment",subscriptionData);

    return (
        <>
            <Head title="Payment Management" />

            <BlogLayout
                settings={settings}
                filters={filters}
                currentPlan={currentPlan}
                userPlanLimits={userPlanLimits}
                auth={authData}
                ziggy={ziggyData}
            >
                <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sora">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Management</h1>

                        {/* Success/Error Messages */}
                        {successMessage && (
                            <div className="mb-6 flex items-center p-4 text-green-700 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="flex-1">{successMessage}</span>
                                <button
                                    onClick={() => setSuccessMessage(null)}
                                    className="ml-auto text-green-700 hover:text-green-900"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-6 flex items-center p-4 text-red-700 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="flex-1">{errorMessage}</span>
                                <button
                                    onClick={() => setErrorMessage(null)}
                                    className="ml-auto text-red-700 hover:text-red-900"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Current Subscription Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>

                            {subscriptionData?.subscription_plan ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-medium">{subscriptionData.subscription_plan.name}</p>
                                            <p className="text-gray-600">
                                                ${subscriptionData.subscription_plan.price}
                                                {subscriptionData.subscription_plan.billing_period !== 'lifetime' &&
                                                 subscriptionData.subscription_plan.price > 0 &&
                                                    `/${subscriptionData.subscription_plan.billing_period}`
                                                }
                                            </p>
                                        </div>

                                        {subscriptionData.stripe_subscription && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                subscriptionData.stripe_subscription.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {subscriptionData.stripe_subscription.status}
                                            </span>
                                        )}
                                    </div>

                                    {/* Auto-Renewal Display Only (Not clickable) */}
                                    {subscriptionData.subscription_plan.price > 0 &&
                                     subscriptionData.subscription_plan.billing_period !== 'lifetime' && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Info className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Auto-Renewal Status</p>
                                                    <p className="text-sm text-gray-600">
                                                        {subscriptionData.auto_renew
                                                            ? 'Your subscription will renew automatically'
                                                            : 'Your subscription will not renew automatically'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Display-only toggle (not interactive) */}
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                subscriptionData.auto_renew ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}>
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        subscriptionData.auto_renew ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Lifetime Plan Notice */}
                                    {isLifetimePlan() && (
                                        <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <Check className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            <p className="text-sm text-yellow-800">
                                                You have lifetime access. No renewal needed!
                                            </p>
                                        </div>
                                    )}

                                    {/* Cancel/Resume Subscription */}
                                    {subscriptionData.has_active_subscription &&
                                     !isLifetimePlan() && (
                                        <div className="flex space-x-3">
                                            {subscriptionData.stripe_subscription?.on_grace_period ? (
                                                <button
                                                    onClick={handleResumeSubscription}
                                                    disabled={actionLoading === 'resume'}
                                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {actionLoading === 'resume' ? (
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-5 h-5 mr-2" />
                                                    )}
                                                    Resume Subscription
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleCancelSubscription}
                                                    disabled={actionLoading === 'cancel'}
                                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {actionLoading === 'cancel' ? (
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    ) : (
                                                        <X className="w-5 h-5 mr-2" />
                                                    )}
                                                    Cancel Subscription
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-600">No active subscription</p>
                            )}
                        </div>

                        {/* Payment History Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment History</h2>

                            {invoices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Date</th>
                                                <th className="text-left py-3 px-4">Amount</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-right py-3 px-4">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">{invoice.date}</td>
                                                    <td className="py-3 px-4 font-medium">{invoice.total}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            invoice.status === 'paid'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <a
                                                            href={`/api/subscription/invoices/${invoice.id}/download`}
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No payment history available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </BlogLayout>
        </>
    );
};

export default PaymentManagement;
