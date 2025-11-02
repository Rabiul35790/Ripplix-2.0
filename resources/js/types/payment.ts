export interface PaymentGateway {
    id: number;
    name: string;
    slug: string;
    mode: 'test' | 'live';
    is_active: boolean;
}

export interface PaymentInitiateResponse {
    success: boolean;
    payment_id: number;
    transaction_id: string;
    gateway: string;
    data: {
        client_secret?: string;
        redirect_url?: string;
        payment_intent_id?: string;
    };
}

export interface PaymentData {
    pricing_plan_id: number;
    amount: number;
    currency: string;
    plan_name: string;
}
