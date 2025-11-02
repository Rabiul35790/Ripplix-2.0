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

interface EmptyStateProps {
    loading: boolean;
    displayPlans: PricingPlan[];
    onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    loading,
    displayPlans,
    onRefresh
}) => {
    if (loading || displayPlans.length > 0) {
        return null;
    }

    return (
        <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No pricing plans available</p>
            <button
                onClick={onRefresh}
                className="text-[#2B235A] hover:opacity-95 text-sm"
            >
                Refresh data
            </button>
        </div>
    );
};

export default EmptyState;
