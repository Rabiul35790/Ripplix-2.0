// types/pricing.ts

export interface PricingPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_period: 'monthly' | 'yearly' | 'lifetime' | 'free';
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
}

export interface CurrentPlan extends PricingPlan {
    expires_at?: string;
    days_until_expiry?: number;
    is_expired?: boolean;
    expires_soon?: boolean;
}

export interface SubscriptionStatus {
    authenticated: boolean;
    current_plan?: CurrentPlan | null;
    subscription_status?: {
        is_expired: boolean;
        expires_soon: boolean;
        days_until_expiry?: number;
    };
}

export interface PaymentData {
    pricing_plan_id: number;
    amount: number;
    currency: string;
    plan_name: string;
}

export interface PaymentInitiateResponse {
    success: boolean;
    payment_id?: number;
    transaction_id?: string;
    gateway?: 'stripe' | 'sslcommerz';
    data: {
        client_secret?: string;
        redirect_url?: string;
        session_id?: string;
        payment_intent_id?: string;
    };
    error?: string;
}

export interface PricingProps {
    plans: PricingPlan[];
    currentPlan?: CurrentPlan | null;
}

export interface PricingCardProps {
    plan: PricingPlan;
    isCurrentPlan?: boolean;
    onSelectPlan?: (planId: number) => void;
}

export interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentData: PaymentData;
    onSuccess: () => void;
}

export interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    currentPlan?: CurrentPlan | null;
}

// API Response types
export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PlanUpdateResponse {
    message: string;
    plan: PricingPlan;
}

// Hook types
export interface UsePaymentReturn {
    initiatePayment: (planId: number) => Promise<PaymentInitiateResponse | null>;
    loading: boolean;
    error: string | null;
}

// Subscription analytics types (for admin use)
export interface SubscriptionAnalytics {
    total_active_subscriptions: number;
    expiring_soon: number;
    expired_pending_downgrade: number;
    lifetime_subscribers: number;
    monthly_subscribers: number;
    yearly_subscribers: number;
    free_members: number;
    mrr: number;
}

// Header component props update
export interface HeaderProps {
    libraries: Library[];
    onSearch: (query: string) => void;
    searchQuery: string;
    userLibraryIds?: number[];
    auth: PageProps['auth'];
    ziggy?: PageProps['ziggy'];
    filters?: {
        platforms: Filter[];
        categories: Filter[];
        industries: Filter[];
        interactions: Filter[];
    };
    currentPlan?: CurrentPlan | null;
}

export interface Library {
    id: number;
    title: string;
    slug: string;
    url: string;
    video_url: string;
    description?: string;
    logo?: string;
    platforms: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string; image?: string }>;
    industries: Array<{ id: number; name: string }>;
    interactions: Array<{ id: number; name: string }>;
}

export interface Filter {
    id: number;
    name: string;
    slug: string;
    image?: string;
}

export interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
            pricing_plan_id?: number;
        } | null;
    };
    ziggy?: any;
}
