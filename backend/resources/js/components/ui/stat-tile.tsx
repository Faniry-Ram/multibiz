import * as React from 'react';

import { cn } from '@/lib/utils';

type StatTileVariant = 'default' | 'featured' | 'alert';

const VARIANT_CLASSES: Record<StatTileVariant, string> = {
    default: 'bg-surface border border-border shadow-[var(--shadow)]',
    featured: 'bg-primary text-white',
    alert: 'bg-warn-soft',
};

function StatTile({
    label,
    value,
    sub,
    valueColor,
    variant = 'default',
    className,
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    /** CSS color for the value text, ignored when variant="featured" */
    valueColor?: string;
    variant?: StatTileVariant;
    className?: string;
}) {
    const isFeatured = variant === 'featured';

    return (
        <div
            data-slot="stat-tile"
            className={cn(
                'flex flex-col gap-1 rounded-[14px] p-4',
                VARIANT_CLASSES[variant],
                className,
            )}
        >
            <span
                className={cn(
                    'text-[12.5px]',
                    isFeatured ? 'text-[#EFF6FF]' : 'text-muted',
                    variant === 'alert' && 'text-warn',
                )}
            >
                {label}
            </span>
            <span
                className="num text-xl font-medium"
                style={!isFeatured && valueColor ? { color: valueColor } : undefined}
            >
                {value}
            </span>
            {sub && (
                <span
                    className={cn(
                        'text-xs',
                        isFeatured ? 'text-[#EFF6FF]' : 'text-muted',
                        variant === 'alert' && 'num text-warn',
                    )}
                >
                    {sub}
                </span>
            )}
        </div>
    );
}

export { StatTile };
