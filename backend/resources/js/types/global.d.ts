import type { Auth } from '@/types/auth';
import type { Appearance } from '@/hooks/use-appearance';
import type { SidebarProject, SyncStatus } from '@/types/navigation';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            appearance: Appearance;
            sidebarProjects: SidebarProject[];
            syncStatus: SyncStatus;
            activeTimer: null;
            [key: string]: unknown;
        };
    }
}
