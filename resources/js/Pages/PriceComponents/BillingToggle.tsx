import React from 'react';

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

interface BillingToggleProps {
    isAnnual: boolean;
    setIsAnnual: (isAnnual: boolean) => void;
    displayPlans: PricingPlan[];
}

const BillingToggle: React.FC<BillingToggleProps> = ({
    isAnnual,
    setIsAnnual,
    displayPlans
}) => {
    if (displayPlans.length === 0) {
        return null;
    }

    return (
        <div className="flex justify-left mb-2 sm:mb-3">
            <div className="bg-[#FFFFFF] border border-[#E3E2FF] dark:bg-gray-800 p-0.5 sm:p-1 rounded-lg flex text-xs sm:text-sm">
                <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors focus:outline-none focus:ring-0 ${
                        !isAnnual
                            ? 'bg-[#F5F5FA] border border-[#E3E2FF] dark:bg-gray-700 text-[#0A081B] font-semibold dark:text-white shadow-sm'
                            : 'text-[#2B235A] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors focus:outline-none focus:ring-0 relative ${
                        isAnnual
                            ? 'bg-[#F5F5FA] border border-[#E3E2FF] dark:bg-gray-700 text-[#0A081B] font-semibold dark:text-white shadow-sm'
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
    );
};

export default BillingToggle;
