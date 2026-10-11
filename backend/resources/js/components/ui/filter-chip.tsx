import * as React from 'react';

import { cn } from '@/lib/utils';

function FilterChip({
    pressed,
    onPressedChange,
    color,
    children,
    className,
}: {
    pressed: boolean;
    onPressedChange: () => void;
    /** optional colored dot, e.g. a project color */
    color?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={pressed}
            onClick={onPressedChange}
            className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors',
                pressed
                    ? 'bg-primary-soft font-semibold text-primary-text'
                    : 'border border-border text-text2 hover:bg-surface2',
                className,
            )}
        >
            {color && (
                <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ background: color }}
                />
            )}
            {children}
        </button>
    );
}

export { FilterChip };
