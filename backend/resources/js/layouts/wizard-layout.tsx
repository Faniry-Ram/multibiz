import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { dashboard } from '@/routes';

export default function WizardLayout({
    title,
    draftLabel,
    children,
}: {
    title: string;
    draftLabel?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col bg-bg text-text">
            <header className="flex flex-wrap items-center gap-3.5 border-b border-border bg-surface px-9 py-3.5">
                <Link
                    href={dashboard()}
                    className="flex items-center gap-2.5 text-text no-underline"
                >
                    <span className="num grid size-8 place-items-center rounded-[9px] bg-primary text-sm font-medium text-white">
                        mb
                    </span>
                    <span className="text-lg font-bold tracking-[-0.02em]">
                        MultiBiz
                    </span>
                </Link>
                <span aria-hidden="true" className="h-5.5 w-px bg-border" />
                <span className="text-[14.5px] font-semibold text-text2">
                    {title}
                </span>
                {draftLabel && (
                    <span className="num ml-auto text-xs text-muted">
                        {draftLabel}
                    </span>
                )}
                <ThemeToggle className={draftLabel ? undefined : 'ml-auto'} />
                <Link
                    href={dashboard()}
                    className="flex h-10 items-center rounded-lg border border-border px-3.5 text-sm font-semibold text-text no-underline"
                >
                    Annuler
                </Link>
            </header>

            <div className="dot-grid flex-1 px-9 py-8">
                <div className="mx-auto flex max-w-[1180px] flex-col gap-6.5">
                    {children}
                </div>
            </div>
        </div>
    );
}
