import { Plus, Search } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

function TopBar({
    searchPlaceholder = "Rechercher dans l'historique…",
    searchInputRef,
    syncLabel,
    onNoteEntry,
    userMenu,
    className,
}: {
    searchPlaceholder?: string;
    searchInputRef?: Ref<HTMLInputElement>;
    syncLabel: string;
    onNoteEntry: () => void;
    userMenu?: ReactNode;
    className?: string;
}) {
    return (
        <header
            className={cn(
                'flex flex-wrap items-center gap-3 border-b border-border bg-surface px-9 py-3.5',
                className,
            )}
        >
            <div className="flex h-10 max-w-[480px] flex-1 items-center gap-2.5 rounded-lg border border-border bg-bg px-3">
                <Search aria-hidden="true" className="size-4 text-muted" />
                <label htmlFor="cmdk" className="sr-only">
                    Rechercher dans l'historique
                </label>
                <input
                    id="cmdk"
                    ref={searchInputRef}
                    type="search"
                    placeholder={searchPlaceholder}
                    className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <kbd className="num rounded-[5px] border border-border px-1.5 py-0.5 text-[11px] text-muted">
                    ⌘K
                </kbd>
            </div>

            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-pos-soft px-2.5 py-1.5 text-[12.5px] font-medium text-pos">
                <span className="size-1.5 rounded-full bg-pos" />
                {syncLabel}
            </span>

            <ThemeToggle />

            <Button onClick={onNoteEntry}>
                <Plus aria-hidden="true" className="size-4" strokeWidth={2.4} />
                Noter un flux
            </Button>

            {userMenu}
        </header>
    );
}

export { TopBar };
