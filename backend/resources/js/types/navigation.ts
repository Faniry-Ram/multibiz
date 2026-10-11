import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type SidebarProjectCategory = {
    id: string;
    name: string;
    kind: 'income' | 'expense' | 'investment';
};

/** The `projects` prop shared by HandleInertiaRequests — see app/Http/Middleware/HandleInertiaRequests.php. */
export type SidebarProject = {
    id: string;
    name: string;
    color: string | null;
    href: string;
    model: 'lots' | 'herd' | 'resale' | 'simple';
    capital_recovered_percent: number;
    verdict: 'starting' | 'profitable' | 'watch' | 'loss';
    verdict_tone: 'pos' | 'warn' | 'primary' | 'neg';
    categories: SidebarProjectCategory[];
};

export type SyncStatus = {
    state: 'synced' | 'syncing' | 'offline';
};
