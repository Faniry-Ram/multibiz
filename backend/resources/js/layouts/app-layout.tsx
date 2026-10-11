import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckSquare,
    History,
    LayoutGrid,
    Settings,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EntryFormDialog } from '@/components/entry-form-dialog';
import { MilestoneFormDialog } from '@/components/milestone-form-dialog';
import { type NavItem, NavSidebar } from '@/components/nav-sidebar';
import { TopBar } from '@/components/top-bar';
import { UserMenu } from '@/components/user-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { analysis, dashboard, history, pocket, tasks } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import { index as projectsIndex } from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';

const SYNC_LABELS: Record<string, string> = {
    synced: 'Synchronisé',
    syncing: 'Synchronisation…',
    offline: 'Hors ligne',
};

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
    );
}

export default function AppLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth, sidebarProjects, syncStatus } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            if (isTypingTarget(event.target)) {
                return;
            }

            if (event.key === 'n' || event.key === 'N') {
                event.preventDefault();
                setEntryDialogOpen(true);
            } else if (event.key === 'j' || event.key === 'J') {
                event.preventDefault();
                setMilestoneDialogOpen(true);
            }
        }

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const navItems: NavItem[] = [
        {
            label: "Vue d'ensemble",
            href: toUrl(dashboard()),
            icon: LayoutGrid,
            current: isCurrentUrl(dashboard()),
        },
        {
            label: 'Analyse',
            href: toUrl(analysis()),
            icon: BarChart3,
            current: isCurrentUrl(analysis()),
        },
        {
            label: 'Ma poche',
            href: toUrl(pocket()),
            icon: Wallet,
            current: isCurrentUrl(pocket()),
        },
        {
            label: 'Historique',
            href: toUrl(history()),
            icon: History,
            current: isCurrentUrl(history()),
        },
        {
            label: 'Tâches',
            href: toUrl(tasks()),
            icon: CheckSquare,
            current: isCurrentUrl(tasks()),
        },
        {
            label: 'Paramètres',
            href: toUrl(editProfile()),
            icon: Settings,
            current: isCurrentOrParentUrl(editProfile()),
        },
    ];

    return (
        <div className="flex min-h-screen bg-bg text-text">
            <NavSidebar
                navItems={navItems}
                newProjectHref={toUrl(projectsIndex())}
                projects={sidebarProjects.map((project) => ({
                    name: project.name,
                    href: project.href,
                    color: project.color ?? 'var(--c1)',
                    current: isCurrentOrParentUrl(project.href),
                    recoveredLabel: `${project.capital_recovered_percent} %`,
                    recoveredColor: `var(--${project.verdict_tone === 'primary' ? 'primary-text' : project.verdict_tone})`,
                }))}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar
                    searchInputRef={searchInputRef}
                    syncLabel={SYNC_LABELS[syncStatus.state]}
                    onNoteEntry={() => setEntryDialogOpen(true)}
                    userMenu={auth.user && <UserMenu user={auth.user} />}
                />
                <main className="dot-grid min-w-0 flex-1">{children}</main>
            </div>

            {sidebarProjects.length > 0 && (
                <>
                    <EntryFormDialog
                        open={entryDialogOpen}
                        onOpenChange={setEntryDialogOpen}
                        projects={sidebarProjects}
                    />
                    <MilestoneFormDialog
                        open={milestoneDialogOpen}
                        onOpenChange={setMilestoneDialogOpen}
                        projects={sidebarProjects}
                    />
                </>
            )}
        </div>
    );
}
