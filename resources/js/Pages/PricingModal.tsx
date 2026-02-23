import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { X, RefreshCw } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import PaymentModal from '../Components/PaymentModal';
import CurrentPlanStatus from './PriceComponents/CurrentPlanStatus';
import AuthMessage from './PriceComponents/AuthMessage';
import LoadingSpinner from './PriceComponents/LoadingSpinner';
import BillingToggle from './PriceComponents/BillingToggle';
import PricingGrid from './PriceComponents/PricingGrid';
import ErrorMessage from './PriceComponents/ErrorMessage';
import EmptyState from './PriceComponents/EmptyState';

interface PricingPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_period: string;
    original_price?: number;
    currency: string;
    description: string;
    grid_list_visibility: string;
    daily_previews: string;
    boards_create: string;
    board_sharing: boolean;
    ads: boolean;
    extras: string;
    features: Array<{ feature: string } | string>;
    is_active: boolean;
    is_featured: boolean;
    student_discount_percentage?: number;
    button_text: string;
    button_color: string;
    highlight_color?: string;
    formatted_price: string;
    formatted_student_price?: string;
    sort_order: number;
    updated_at?: string;
    fetched_at?: string;
}

interface CurrentPlan extends PricingPlan {
    expires_at?: string;
    days_until_expiry?: number;
    is_on_trial?: boolean;
    can_take_trial?: boolean;
}

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({
    isOpen,
    onClose,
    isAuthenticated
}) => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPlanLoading, setCurrentPlanLoading] = useState(false);
    const [trialLoading, setTrialLoading] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();

    // Fetch current plan function
    const fetchCurrentPlan = async (showLoader: boolean = false) => {
        if (!isAuthenticated) {
            setCurrentPlan(null);
            return;
        }

        try {
            if (showLoader) setCurrentPlanLoading(true);

            const timestamp = new Date().getTime();
            const randomParam = Math.random().toString(36).substring(7);

            const response = await fetch(`/api/pricing/current-plan?t=${timestamp}&r=${randomParam}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Authorization': `Bearer ${document.querySelector('meta[name="api-token"]')?.getAttribute('content') || ''}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const planData = await response.json();
                if (JSON.stringify(planData) !== JSON.stringify(currentPlan)) {
                    setCurrentPlan(planData);
                    console.log('Current plan updated:', planData?.name || 'No plan', 'at', new Date().toLocaleTimeString());
                }
            } else if (response.status === 401) {
                setCurrentPlan(null);
            }
        } catch (error) {
            console.error('Failed to fetch current plan:', error);
            setCurrentPlan(null);
        } finally {
            if (showLoader) setCurrentPlanLoading(false);
        }
    };

    // Free trial start function
    const handleStartTrial = async () => {
        if (!isAuthenticated || !currentPlan?.can_take_trial) return;

        try {
            setTrialLoading(true);

            const response = await fetch('/api/pricing/start-trial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Trial started successfully:', result);

                // Refresh current plan data immediately
                await fetchCurrentPlan(false);

                // Optionally show success message or reload page
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Trial start failed:', errorData.error);
                alert(errorData.error || 'Failed to start trial');
            }
        } catch (error) {
            console.error('Trial start error:', error);
            alert('Failed to start trial. Please try again.');
        } finally {
            setTrialLoading(false);
        }
    };

    // Continuous data refresh function
    const fetchFreshPlans = async (showLoader: boolean = false) => {
        try {
            if (showLoader) setLoading(true);

            const timestamp = new Date().getTime();
            const randomParam = Math.random().toString(36).substring(7);

            const response = await fetch(`/api/pricing/plans?t=${timestamp}&r=${randomParam}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });

            if (response.ok) {
                const freshData = await response.json();
                if (JSON.stringify(freshData) !== JSON.stringify(plans)) {
                    setPlans(Array.isArray(freshData) ? freshData : []);
                    // console.log('Plans updated:', freshData.length, 'plans at', new Date().toLocaleTimeString());
                }
                setLastFetched(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch fresh plans:', error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // Refresh both plans and current plan
    const refreshAllData = async (showLoader: boolean = false) => {
        await Promise.all([
            fetchFreshPlans(showLoader),
            fetchCurrentPlan(showLoader)
        ]);
    };

    // Setup continuous refresh when modal opens
    useEffect(() => {
        if (isOpen) {
            refreshAllData(true);
            refreshIntervalRef.current = setInterval(() => {
                refreshAllData(false);
            }, 3000);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [isOpen, isAuthenticated]);

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    // Fetch current plan when authentication status changes
    useEffect(() => {
        if (isOpen) {
            fetchCurrentPlan(false);
        }
    }, [isAuthenticated]);

    // Handle outside click - only when payment modal is not open
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close if payment modal is open
            if (showPaymentModal) return;

            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen && !showPaymentModal) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, showPaymentModal, onClose]);

    // Helper function to check if Free Member plan should be disabled
    const isFreeMemberDisabled = (plan: PricingPlan): boolean => {
        if (!currentPlan || currentPlan.price === 0) return false;

        const isPlanExpired = currentPlan.days_until_expiry !== undefined &&
                             currentPlan.days_until_expiry !== null &&
                             currentPlan.days_until_expiry < 0;

        if (isPlanExpired) return false;
        return currentPlan.price > 0 && plan.slug === 'free-member';
    };

    const handleSelectPlan = async (plan: PricingPlan) => {
        if (!isAuthenticated) {
            router.get('/login', {
                redirect: `/pricing?plan=${plan.slug}`
            });
            return;
        }

        if (isFreeMemberDisabled(plan)) {
            return;
        }

        if (plan.price === 0) {
            try {
                const response = await fetch('/api/pricing/update-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ plan_id: plan.id }),
                });

                if (response.ok) {
                    await refreshAllData(false);
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error updating plan:', error);
            }
            return;
        }

        const result = await initiatePayment(plan.id);

        if (result?.success) {
            if (result.gateway === 'stripe') {
                setSelectedPlan(plan);
                setShowPaymentModal(true);
            } else if (result.gateway === 'sslcommerz') {
                window.location.href = result.data.redirect_url!;
            }
        }
    };

    const handleRenewPlan = async (plan: PricingPlan) => {
        if (!isAuthenticated) return;

        const result = await initiatePayment(plan.id);

        if (result?.success) {
            if (result.gateway === 'stripe') {
                setSelectedPlan(plan);
                setShowPaymentModal(true);
            } else if (result.gateway === 'sslcommerz') {
                window.location.href = result.data.redirect_url!;
            }
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setSelectedPlan(null);
        onClose();
        refreshAllData(false).then(() => {
            window.location.reload();
        });
    };

    // Get filtered plans based on active tab - exclude visitor plan (sort_order: 1)
    const getFilteredPlans = () => {
        const activePlans = plans.filter(plan =>
            plan.is_active &&
            plan.sort_order !== 1
        );

        if (isAnnual) {
            return activePlans.filter(plan =>
                plan.billing_period === 'yearly' || plan.billing_period === 'lifetime'
            );
        } else {
            return activePlans.filter(plan =>
                plan.billing_period === 'free' || plan.billing_period === 'monthly'
            );
        }
    };

    const displayPlans = getFilteredPlans();
    const isLoadingData = loading || currentPlanLoading;

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 font-sora">
                <div ref={modalContentRef} className="bg-white border-2 sm:border-3 border-[#E3E2FF] dark:bg-gray-900 rounded-md shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                    <div className="py-4 px-4 sm:py-6 sm:px-8 md:py-8 md:px-12 lg:px-16">
                        {/* Header with live data indicator */}
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2B235A] dark:text-white">
                                        Membership
                                    </h2>
                                </div>
                                <button
                                    onClick={() => refreshAllData(true)}
                                    disabled={isLoadingData}
                                    className="p-1.5 sm:p-2 text-[#9D9DA8] hover:text-[#2B235A] dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-0 duration-500"
                                    title="Force refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoadingData ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-[#9D9DA8] hover:text-[#2B235A] dark:hover:text-gray-300 p-1 bg-[#F7F7FC] focus:outline-none focus:ring-0 transition-colors rounded-sm duration-500"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>



                        <BillingToggle
                            isAnnual={isAnnual}
                            setIsAnnual={setIsAnnual}
                            displayPlans={displayPlans}
                        />

                        <PricingGrid
                            displayPlans={displayPlans}
                            currentPlan={currentPlan}
                            isAuthenticated={isAuthenticated}
                            onSelectPlan={handleSelectPlan}
                            paymentLoading={paymentLoading}
                            isFreeMemberDisabled={isFreeMemberDisabled}
                        />

                        <ErrorMessage paymentError={paymentError} />

                        <EmptyState
                            loading={loading}
                            displayPlans={displayPlans}
                            onRefresh={() => refreshAllData(true)}
                        />
                    </div>
                </div>
            </div>


        </>
    );
};

export default PricingModal;
