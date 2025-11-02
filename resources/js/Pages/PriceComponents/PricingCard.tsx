import React from 'react';
import { Check, Sparkles, User } from 'lucide-react';

// Animated Gradient Border Styles
export const AnimatedGradientBorderStyles = () => (
    <style>{`
        @keyframes rotate-gradient {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .animated-gradient-border {
            position: relative;
            padding: 2px;
            border-radius: 0.75rem;
            overflow: hidden;
        }

        .animated-gradient-border::before {
            content: '';
            position: absolute;
            inset: -100%;
            background: linear-gradient(90deg, #FF6D1B, #FFEE55, #5BFF89, #4D8AFF, #6B5FFF, #FF64F9, #FF6565);
            animation: rotate-gradient 4s linear infinite;
        }

        .animated-gradient-border-inner {
            position: relative;
            background: white;
            border-radius: 0.6rem;
            z-index: 1;
        }

        .dark .animated-gradient-border-inner {
            background: rgb(31, 41, 55);
        }

        .animated-gradient-border-button {
            position: relative;
            padding: 2px;
            border-radius: 0.25rem;
            overflow: hidden;
            display: inline-block;
        }

        .animated-gradient-border-button::before {
            content: '';
            position: absolute;
            inset: -100%;
            background: linear-gradient(90deg, #FF6D1B, #FFEE55, #5BFF89, #4D8AFF, #6B5FFF, #FF64F9, #FF6565);
            animation: rotate-gradient 4s linear infinite;
        }

        .animated-gradient-border-button-inner {
            position: relative;
            z-index: 1;
        }
    `}</style>
);

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
}

interface PricingCardProps {
    plan: PricingPlan;
    currentPlan: CurrentPlan | null;
    isAuthenticated: boolean;
    onSelectPlan: (plan: PricingPlan) => Promise<void>;
    paymentLoading: boolean;
    isDisabled: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
    plan,
    currentPlan,
    isAuthenticated,
    onSelectPlan,
    paymentLoading,
    isDisabled
}) => {
    const getFeaturesArray = (plan: PricingPlan) => {
        const features: string[] = [];

        if (plan.grid_list_visibility) features.push(`Grid/List: ${plan.grid_list_visibility}`);
        if (plan.daily_previews) features.push(`Daily Previews: ${plan.daily_previews}`);
        if (plan.boards_create) features.push(`Boards: ${plan.boards_create}`);
        if (plan.board_sharing) features.push('Board Sharing');
        if (!plan.ads) features.push('Ad-Free Experience');
        if (plan.extras) features.push(plan.extras);

        if (plan.features && plan.features.length > 0) {
            plan.features.forEach(feature => {
                if (typeof feature === 'string') {
                    features.push(feature);
                } else if (feature && typeof feature === 'object' && 'feature' in feature) {
                    features.push(feature.feature);
                }
            });
        }

        return features;
    };

    const getPriceDisplay = (plan: PricingPlan) => {
        const symbol = plan.currency === 'USD' ? '$' : plan.currency;

        if (plan.price === 0) {
            return (
                <div className="text-left mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">$0 <span className='font-normal text-xs sm:text-sm'>/Month</span></div>
                    {/* <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Forever</div> */}

                </div>
            );
        }

        return (
            <div className="text-left mb-4 sm:mb-6">
                {/* Original price (optional) */}
                {/* {plan.original_price && plan.original_price > plan.price && (
                    <div className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        {symbol}{plan.original_price}
                    </div>
                )} */}

                <div className="flex justify-start items-baseline gap-1 sm:gap-2 text-[#0A081B] dark:text-white">
                    <div className="text-2xl sm:text-3xl font-bold">
                        {symbol}{plan.price}
                    </div>
                    <div className="text-xs sm:text-sm text-[#62626C] dark:text-gray-300">
                        {plan.billing_period === 'monthly' && '/Month'}
                        {plan.billing_period === 'yearly' && '/Year'}
                        {plan.billing_period === 'lifetime' && '/one-time payment'}
                    </div>
                </div>

                {/* Yearly discount (optional) */}
                {/* {plan.billing_period === 'yearly' && (
                    <div className="text-sm text-green-600 font-medium dark:text-green-400 mt-1">
                        Save 33% annually
                    </div>
                )} */}
            </div>

        );
    };

    const getDiscountBadge = (plan: PricingPlan) => {
        if (plan.original_price && plan.original_price > plan.price) {
            const discountPercentage = Math.round(((plan.original_price - plan.price) / plan.original_price) * 100);
            return (
                <>
                </>
                // <div className="absolute -top-3 -right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                //     -{discountPercentage}%
                // </div>
            );
        }
        return null;
    };

    const features = getFeaturesArray(plan);
    const isCurrentPlan = currentPlan?.id === plan.id;

    return (
        <>
            {plan.is_featured && (
                <style>{`
                    @keyframes rotate-gradient {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }

                    .animated-gradient-border {
                        position: relative;
                        padding: 4px;
                        border-radius: 0.75rem;
                        overflow: hidden;
                    }

                    .animated-gradient-border::before {
                        content: '';
                        position: absolute;
                        inset: -100%;
                        background: linear-gradient(90deg, #FF6D1B, #FFEE55, #5BFF89, #4D8AFF, #6B5FFF, #FF64F9, #FF6565);
                        animation: rotate-gradient 4s linear infinite;
                    }

                    .animated-gradient-border-inner {
                        position: relative;
                        background: white;
                        border-radius: 0.6rem;
                        z-index: 1;
                    }

                    .dark .animated-gradient-border-inner {
                        background: rgb(31, 41, 55);
                    }
                `}</style>
            )}

            <div
                className={`relative ${
                    plan.is_featured
                        ? 'animated-gradient-border'
                        : 'dark:bg-gray-800 rounded-xl border-[1px] border-[#CECCFF] dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } transition-all duration-300 ${
                    isCurrentPlan && !plan.is_featured ? 'border-[#CECCFF]' : ''
                } ${
                    isDisabled ? 'opacity-60' : ''
                }`}
            >
                {getDiscountBadge(plan)}

                {plan.is_featured && (
                    <div className="absolute top-4 sm:top-6 right-0 pr-5 z-10">
                        <div className="p-[1.5px] rounded-full bg-[linear-gradient(93.21deg,#9943EE_35.36%,#D85989_144.96%)]">
                            <div className="bg-[#F5F5FA] text-[#2B235A] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                <Sparkles className="h-3 w-3 fill-[#9943EE] text-[#9943EE]" />
                                Popular
                            </div>
                        </div>
                    </div>
                )}

                <div className={`p-3 sm:p-4 ${plan.is_featured ? 'animated-gradient-border-inner' : ''}`}>
                    <div className="text-left mb-2">
                        {/* <h3 className="text-base sm:text-xl max-w-10 font-bold border px-2 py-2 sm:py-3 border-[#E7E7F3] text-[#BCBDC8] bg-white dark:text-white mb-2 rounded-xl">
                            <User className='text-center w-full font-bold'/>
                        </h3> */}
                        <h3 className="text-2xl sm:text-2xl font-bold text-[#474750] dark:text-white mb-1 sm:mb-2">
                            {plan.name}
                        </h3>
                        {plan.description && (
                            <p className="text-[#62626C] dark:text-gray-300 text-xs sm:text-sm max-w-60 break-words">
                            {plan.description}
                            </p>

                        )}
                    </div>

                    {getPriceDisplay(plan)}

                    <button
                        onClick={() => onSelectPlan(plan)}
                        disabled={isCurrentPlan || paymentLoading || isDisabled}
                        className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md font-semibold transition-all duration-200 text-xs sm:text-sm focus:outline-none focus:ring-0 ${
                            isCurrentPlan
                                ? 'bg-[#ededfa] dark:bg-gray-700 text-[] dark:text-gray-400 cursor-not-allowed'
                                : isDisabled
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : plan.is_featured
                                        ? 'holographic-link2 bg-[#784AEF] hover:opacity-90 text-white shadow-lg hover:shadow-xl'
                                        : 'holographic-link2 bg-[#784AEF] hover:opacity-90 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                        } ${paymentLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                            backgroundColor: !isCurrentPlan && !isDisabled && !plan.is_featured && !paymentLoading
                                ? plan.button_color
                                : undefined
                        }}
                    >
                        <span className='z-3'>
                            {paymentLoading ? 'Processing...' :
                            isCurrentPlan ? 'Current Plan' :
                            isDisabled ? 'Not Available' :
                            !isAuthenticated ? 'Sign in to Purchase' :
                            plan.button_text}
                        </span>
                    </button>

                    {/* {plan.formatted_student_price && (
                        <div className="text-center mb-4 p-3 bg-[#FAF9F6] dark:bg-blue-900 rounded-lg">
                            <div className="text-xs text-[#564638] dark:text-blue-300 font-medium">
                                Student Price
                            </div>
                            <div className="text-sm font-bold text-[#564638] dark:text-blue-200">
                                {plan.formatted_student_price}
                            </div>
                            <div className="text-xs text-[#564638] dark:text-blue-400">
                                Save {plan.student_discount_percentage}%
                            </div>
                        </div>
                    )} */}

                    <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4 mb-4 sm:mb-6">
                        <div>
                            <span className="text-[#7F7F8A] text-sm sm:text-base font-normal dark:text-gray-200">
                                Value Deal
                            </span>
                        </div>
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
                            <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-xs sm:text-sm">
                                Basic features included
                            </div>
                        )}
                    </div>

                    {plan.billing_period === 'lifetime' && (
                        <div className="text-center mt-2">
                            <div className="text-[10px] sm:text-xs text-[#474750] dark:text-gray-400">
                                One-time payment • Lifetime access
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PricingCard;
