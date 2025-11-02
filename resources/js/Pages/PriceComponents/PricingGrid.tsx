import React from 'react';
import PricingCard from './PricingCard';


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

interface PricingGridProps {
    displayPlans: PricingPlan[];
    currentPlan: CurrentPlan | null;
    isAuthenticated: boolean;
    onSelectPlan: (plan: PricingPlan) => Promise<void>;
    paymentLoading: boolean;
    isFreeMemberDisabled: (plan: PricingPlan) => boolean;
}

const PricingGrid: React.FC<PricingGridProps> = ({
    displayPlans,
    currentPlan,
    isAuthenticated,
    onSelectPlan,
    paymentLoading,
    isFreeMemberDisabled
}) => {
    if (displayPlans.length === 0) {
        return null;
    }

    return (
        <div className={`grid gap-8 ${
            displayPlans.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : displayPlans.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
            {displayPlans.map((plan) => (
                <PricingCard
                    key={plan.id}
                    plan={plan}
                    currentPlan={currentPlan}
                    isAuthenticated={isAuthenticated}
                    onSelectPlan={onSelectPlan}
                    paymentLoading={paymentLoading}
                    isDisabled={isFreeMemberDisabled(plan)}
                />
            ))}
        </div>
    );
};

export default PricingGrid;
