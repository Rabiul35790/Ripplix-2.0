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

interface LoadingSpinnerProps {
    loading: boolean;
    plans: PricingPlan[];
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading, plans }) => {
    if (!loading || plans.length > 0) {
        return null;
    }

    return (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B235A] mx-auto"></div>
            {/* <p className="text-[#7F7F8A] dark:text-gray-300 mt-2">Loading fresh pricing data...</p> */}
        </div>
    );
};

export default LoadingSpinner;
