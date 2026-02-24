
import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string | null; // Make sure this is properly typed
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null; // Allow null for unauthenticated users
    };
    ziggy: Config & { location: string };
    adSettings?: {
        enabled?: boolean;
        client?: string | null;
        can_show_ads?: boolean;
        slots?: {
            sidebar?: string | null;
            home?: string | null;
            modal?: string | null;
            in_feed?: string | null;
        };
    };
};
