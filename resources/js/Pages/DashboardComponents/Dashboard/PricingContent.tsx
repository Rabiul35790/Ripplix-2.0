// resources/js/Pages/DashboardComponents/Dashboard/PricingContent.tsx

import { PricingPlan } from '../../../types/pricing';

interface PricingContentProps {
    pricingPlans: PricingPlan[];
    currentPlan?: PricingPlan;
}

export default function PricingContent({ pricingPlans, currentPlan }: PricingContentProps) {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900/80 -mx-6 -mb-6 px-6 pb-6 rounded-2xl backdrop-blur-sm">
            <div className="py-4">
                {/* <PricingSection
                    plans={pricingPlans}
                    currentPlan={currentPlan}
                /> */}
            </div>
        </div>
    );
}
