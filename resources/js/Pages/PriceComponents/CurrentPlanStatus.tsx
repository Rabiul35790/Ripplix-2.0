import React from 'react';
import { Crown, RotateCcw, Zap } from 'lucide-react';

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

interface CurrentPlanStatusProps {
    isAuthenticated: boolean;
    currentPlan: CurrentPlan | null;
    onRenewPlan: (plan: PricingPlan) => Promise<void>;
    onStartTrial: () => Promise<void>;
    paymentLoading: boolean;
    trialLoading: boolean;
}

const CurrentPlanStatus: React.FC<CurrentPlanStatusProps> = ({
    isAuthenticated,
    currentPlan,
    onRenewPlan,
    onStartTrial,
    paymentLoading,
    trialLoading
}) => {
    if (!isAuthenticated || !currentPlan) {
        return null;
    }

    const showTrialButton = currentPlan.can_take_trial && !currentPlan.is_on_trial;
    const showRenewButton = currentPlan.billing_period !== 'lifetime' && currentPlan.price > 0 && !currentPlan.is_on_trial;

    return (
        <div className="mb-3 sm:mb-4 py-2 px-3 sm:py-3 sm:px-4 bg-[#EEE4FF] dark:bg-blue-900 rounded-md border border-[#CDA0FA1A] shadow-[0px_8px_16px_0px_#E4D0FE40] dark:border-blue-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                    <h3 className="text-sm sm:text-md font-semibold text-[#2B235A] dark:text-blue-100">
                        Current Plan: {currentPlan.name}
                        {currentPlan.is_on_trial && ' (Trial)'}
                        {currentPlan.billing_period !== 'lifetime' && !currentPlan.is_on_trial && ` (${currentPlan.billing_period})`}
                    </h3>
                    {currentPlan.expires_at && (
                        <p className="text-[#817399] dark:text-blue-200 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                            {currentPlan.days_until_expiry !== null && currentPlan.days_until_expiry >= 0
                                ? `${currentPlan.is_on_trial ? 'Trial expires' : 'Expires'} in ${currentPlan.days_until_expiry} days`
                                : `${currentPlan.is_on_trial ? 'Trial expired' : 'Subscription expired'}`
                            }
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Free Trial button - only show for eligible free members */}
                    {showTrialButton && (
                        <button
                            onClick={onStartTrial}
                            disabled={trialLoading}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 holographic-link2 bg-[#784AEF] shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none focus:ring-0 text-white rounded-lg text-[10px] sm:text-sm font-medium hover:opacity-95 transition-all disabled:opacity-50 flex-1 sm:flex-none"
                        >
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 z-10" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {trialLoading ? 'Starting...' : 'Start Free Pro Trial for 7 Days'}
                            </span>
                        </button>
                    )}

                    {/* Renew button - only show for non-lifetime paid plans */}
                    {showRenewButton && (
                        <button
                            onClick={() => onRenewPlan(currentPlan)}
                            disabled={paymentLoading}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 holographic-link2 bg-[#784AEF] shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none focus:ring-0 text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-95 transition-all disabled:opacity-50"
                        >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 z-10" />
                            <span>{paymentLoading ? 'Processing...' : 'Renew Plan'}</span>
                        </button>
                    )}
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#9943EE] fill-current dark:text-blue-400 flex-shrink-0" />
                </div>
            </div>
        </div>
    );
};

export default CurrentPlanStatus;
