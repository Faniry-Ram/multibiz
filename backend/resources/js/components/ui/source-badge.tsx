import * as React from 'react';

import { cn } from '@/lib/utils';

export type EntrySource = 'auto' | 'recurring' | 'manual' | 'low-stock';

const SOURCE: Record<EntrySource, { label: string; className: string }> = {
    auto: { label: 'auto', className: 'bg-primary-soft text-primary-text' },
    recurring: { label: 'récurrent', className: 'bg-slate-soft text-slate-text' },
    manual: {
        label: 'manuel',
        className: 'border border-border text-muted',
    },
    'low-stock': { label: 'stock bas', className: 'bg-warn-soft text-warn' },
};

function SourceBadge({
    source,
    className,
}: {
    source: EntrySource;
    className?: string;
}) {
    const { label, className: toneClass } = SOURCE[source];

    return (
        <span
            data-slot="source-badge"
            className={cn(
                'inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap',
                toneClass,
                className,
            )}
        >
            {label}
        </span>
    );
}

export { SourceBadge };
