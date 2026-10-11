import * as React from 'react';

import { cn } from '@/lib/utils';

function ProgressBar({
    value,
    color = 'var(--pos)',
    className,
    trackClassName,
}: {
    /** 0–100 */
    value: number;
    color?: string;
    className?: string;
    trackClassName?: string;
}) {
    const pct = Math.max(2, Math.min(100, value));

    return (
        <div
            className={cn('h-2 rounded-full bg-surface2', trackClassName)}
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={cn('h-full rounded-full', className)}
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}

export { ProgressBar };
