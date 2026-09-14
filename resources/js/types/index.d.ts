export interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    email_verified_at: string | null;
    phone: string | null;
    satuan_kerja: string | null;
}

export interface Flash {
    success?: string;
    error?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    flash: Flash;
    appName: string;
};
