// File: resources/js/Components/SubscriptionPricingModal.tsx
// Redesigned with new design system - All logic preserved

import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { X, Check, Zap, Loader2, Lock, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    billing_period: string;
    features: string[] | string;
    is_active: boolean;
}

interface CurrentSubscription {
    subscription_plan: SubscriptionPlan | null;
    has_active_subscription: boolean;
    auto_renew: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
}

const SubscriptionPricingModal: React.FC<Props> = ({ isOpen, onClose, isAuthenticated }) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            if (isAuthenticated) {
                fetchCurrentSubscription();
            }
        }
    }, [isOpen, isAuthenticated]);

    const fetchPlans = async () => {
        try {
            const response = await axios.get('/api/subscription/plans');
            if (response.data.success) {
                // console.log('Plans loaded:', response.data.plans);
                setPlans(response.data.plans);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const fetchCurrentSubscription = async () => {
        try {
            const response = await axios.get('/api/subscription/current');
            if (response.data.success) {
                // console.log('Current subscription:', response.data);
                setCurrentSubscription(response.data);
            }
        } catch (error) {
            console.error('Error fetching current subscription:', error);
        }
    };

    // Helper function to parse features
    const parseFeatures = (features: string[] | string | null | undefined): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features;

        if (typeof features === 'string') {
            try {
                const parsed = JSON.parse(features);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    // Check if user is on free plan
    const isOnFreePlan = (): boolean => {
        if (!currentSubscription || !currentSubscription.subscription_plan) {
            return true;
        }
        return currentSubscription.subscription_plan.price === 0;
    };

    // Check if user is on any paid plan
    const isOnPaidPlan = (): boolean => {
        if (!currentSubscription || !currentSubscription.subscription_plan) {
            return false;
        }
        return currentSubscription.subscription_plan.price > 0;
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!isAuthenticated) {
            router.visit('/login');
            return;
        }

        if (plan.price === 0) {
            return;
        }

        if (isOnPaidPlan()) {
            alert('You already have an active paid subscription. Please cancel your current plan before purchasing a new one.');
            return;
        }

        proceedToCheckout(plan);
    };

    const proceedToCheckout = async (plan: SubscriptionPlan) => {
        setCheckoutLoading(plan.id);

        try {
            const response = await axios.post('/api/subscription/checkout', {
                plan_id: plan.id,
            });

            if (response.data.success && response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else if (response.data.redirect) {
                router.visit(response.data.redirect);
            }
        } catch (error: any) {
            console.error('Error creating checkout:', error);
            alert(error.response?.data?.message || 'Failed to start checkout');
            setCheckoutLoading(null);
        }
    };

    const isCurrentPlan = (plan: SubscriptionPlan): boolean => {
        if (!currentSubscription || !currentSubscription.subscription_plan) {
            return false;
        }
        return currentSubscription.subscription_plan.id === plan.id;
    };

    const isDisabled = (plan: SubscriptionPlan): boolean => {
        if (!isAuthenticated) return false;

        if (plan.price === 0) return true;

        if (isOnPaidPlan()) {
            return true;
        }

        return false;
    };

    const getButtonText = (plan: SubscriptionPlan): string => {
        if (!isAuthenticated) {
            return plan.price === 0 ? 'Sign up Free' : 'Sign in to Purchase';
        }

        if (plan.price === 0) {
            return isCurrentPlan(plan) ? 'Current Plan' : 'Free Plan';
        }

        if (isCurrentPlan(plan)) {
            return 'Current Plan';
        }

        if (isOnPaidPlan()) {
            return 'You are on a Paid Plan';
        }

        return 'Subscribe Now';
    };

    const getButtonColor = (plan: SubscriptionPlan): string => {
        if (isDisabled(plan)) {
            if (isCurrentPlan(plan)) {
                return 'bg-[#ededfa] dark:bg-gray-700 text-[#474750] dark:text-gray-400 cursor-not-allowed';
            }
            return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed';
        }

        return 'bg-[#784AEF] hover:opacity-90 text-white shadow-lg hover:shadow-xl';
    };

    // Filter plans based on billing period
    const getFilteredPlans = () => {
        const freePlan = plans.find(p => p.price === 0);

        if (billingPeriod === 'monthly') {
            const monthlyPlans = plans.filter(p => p.billing_period === 'monthly');
            return freePlan ? [freePlan, ...monthlyPlans] : monthlyPlans;
        } else {
            return plans.filter(p =>
                p.billing_period === 'yearly' || p.billing_period === 'lifetime'
            );
        }
    };

    const filteredPlans = getFilteredPlans();

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="backdrop-blur-md bg-black bg-opacity-50 z-[999] p-2 sm:p-4"
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width: '100vw',
                height: '100dvh',
                display: 'grid',
                placeItems: 'center',
            }}
        >
            <div className="bg-white font-sora border-2 sm:border-3 border-[#E3E2FF] dark:bg-gray-900 rounded-md shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-[54rem] max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto">
                <div className="py-4 px-4 sm:py-6 sm:px-8 md:py-8 md:px-12 lg:px-16">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2B235A] dark:text-white">
                                Membership
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-[#9D9DA8] hover:text-[#2B235A] dark:hover:text-gray-300 p-1 bg-[#F7F7FC] focus:outline-none focus:ring-0 transition-colors rounded-sm duration-500"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Sign in message */}
                    {!isAuthenticated && (
                        <div className="mb-4 flex items-center space-x-2 text-[#62626C] dark:text-gray-300 bg-[#F5F5FA] dark:bg-gray-800 px-4 py-3 rounded-lg border border-[#E3E2FF] dark:border-gray-700">
                            <Zap className="w-5 h-5" />
                            <span className="text-sm">Sign in to purchase a plan and unlock premium features</span>
                        </div>
                    )}

                    {/* Billing Period Toggle */}
                    <div className="flex justify-left mb-4 sm:mb-6">
                        <div className="bg-[#FFFFFF] border border-[#E3E2FF] dark:bg-gray-800 dark:border-gray-700 p-0.5 sm:p-1 rounded-lg flex text-xs sm:text-sm">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors focus:outline-none focus:ring-0 ${
                                    billingPeriod === 'monthly'
                                        ? 'bg-[#F5F5FA] border border-[#E3E2FF] dark:bg-gray-700 dark:border-gray-600 text-[#0A081B] font-semibold dark:text-white shadow-sm'
                                        : 'text-[#2B235A] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors focus:outline-none focus:ring-0 relative ${
                                    billingPeriod === 'yearly'
                                        ? 'bg-[#F5F5FA] border border-[#E3E2FF] dark:bg-gray-700 dark:border-gray-600 text-[#0A081B] font-semibold dark:text-white shadow-sm'
                                        : 'text-[#2B235A] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Annual
                                <span className="absolute -top-2 sm:-top-3 -right-3 sm:-right-4 bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full">
                                    Save
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    {filteredPlans.length === 0 ? (
                        <div className="text-center py-12 text-[#62626C] dark:text-gray-400">
                            No plans available for this billing period.
                        </div>
                    ) : (
                        <div className={`grid gap-6 sm:gap-8 ${
                            filteredPlans.length === 1
                                ? 'grid-cols-1 max-w-sm mx-auto'
                                : filteredPlans.length === 2
                                ? 'grid-cols-1 md:grid-cols-2'
                                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        }`}>
                            {filteredPlans.map((plan) => {
                                const isLifetime = plan.billing_period === 'lifetime';
                                const isCurrent = isCurrentPlan(plan);
                                const features = parseFeatures(plan.features);
                                const disabled = isDisabled(plan);
                                const isFeatured = plan.billing_period === 'yearly'? 1 : ''; // Mark paid non-lifetime plans as featured

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative ${
                                            isCurrent && !isFeatured
                                                ? 'dark:bg-gray-800 rounded-xl border-[1px] border-[#CECCFF] dark:border-gray-600'
                                                : 'dark:bg-gray-800 rounded-xl border-[1px] border-[#CECCFF] dark:border-gray-600 hover:border-[#B7B3FF] dark:hover:border-gray-500'
                                        } transition-all duration-300 ${
                                            disabled ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {/* Featured Badge */}
                                        {isFeatured && (
                                            <div className="absolute top-4 sm:top-6 right-0 pr-5 z-10">
                                                <div className="p-[1.5px] rounded-full bg-[linear-gradient(93.21deg,#9943EE_35.36%,#D85989_144.96%)]">
                                                    <div className="bg-[#F5F5FA] dark:bg-gray-800 text-[#2B235A] dark:text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3 fill-[#9943EE] text-[#9943EE]" />
                                                        Popular
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-3 sm:p-4">
                                            {/* Plan Header */}
                                            <div className="text-left mb-2">
                                                <h3 className="text-2xl sm:text-2xl font-bold text-[#474750] dark:text-white mb-1 sm:mb-2">
                                                    {plan.name}
                                                </h3>
                                                {plan.description && (
                                                    <p className="text-[#62626C] dark:text-gray-300 text-xs sm:text-sm max-w-60 break-words">
                                                        {plan.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="text-left mb-4 sm:mb-6">
                                                <div className="flex justify-start items-baseline gap-1 sm:gap-2 text-[#0A081B] dark:text-white">
                                                    <div className="text-2xl sm:text-3xl font-bold">
                                                        ${Math.floor(plan.price)}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-[#62626C] dark:text-gray-300">
                                                        {plan.price === 0 ? '/Free' :
                                                         isLifetime ? '/one-time payment' :
                                                         plan.billing_period === 'yearly' ? '/Year' : '/Month'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => handleSubscribe(plan)}
                                                disabled={disabled || checkoutLoading === plan.id}
                                                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md font-semibold transition-all duration-200 text-xs sm:text-sm focus:outline-none focus:ring-0 mb-3 sm:mb-4 ${
                                                    getButtonColor(plan)
                                                }`}
                                            >
                                                {checkoutLoading === plan.id ? (
                                                    <span className="flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    getButtonText(plan)
                                                )}
                                            </button>

                                            {/* Value Deal Label */}
                                            <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                                                <div>
                                                    <span className="text-[#7F7F8A] text-sm sm:text-base font-normal dark:text-gray-200">
                                                        Value Deal
                                                    </span>
                                                </div>

                                                {/* Features List */}
                                                {features.length > 0 ? (
                                                    features.slice(0, 6).map((feature, index) => (
                                                        <div key={index} className="flex items-start text-xs sm:text-sm">
                                                            <Check className="w-4 h-4 sm:w-5 sm:h-5 bg-[#B7B3FF] p-0.5 sm:p-[3px] text-base rounded-full text-[#F2F2FF] border border-[#F5F5FA] mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" strokeWidth={4}/>
                                                            <span className="text-[#474750] dark:text-gray-200 font-normal text-base leading-relaxed">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-[#62626C] dark:text-gray-400 py-2 text-xs sm:text-sm">
                                                        Basic features included
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Note */}
                                            {isLifetime && (
                                                <div className="text-center mt-2">
                                                    <div className="text-[10px] sm:text-xs text-[#474750] dark:text-gray-400">
                                                        One-time payment • Lifetime access
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(modalContent, document.body);
};

export default SubscriptionPricingModal;
