import * as React from 'react';

import { cn } from '@/lib/utils';

function PageHeader({
    eyebrow,
    title,
    subtitle,
    actions,
    className,
}: {
    eyebrow: string;
    title: string;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-end justify-between gap-4',
                className,
            )}
        >
            <div className="flex flex-col gap-2">
                <span className="num text-[12.5px] text-primary-text">
                    // {eyebrow}
                </span>
                <h1 className="m-0 text-[32px] leading-[1.15] font-bold tracking-[-0.03em]">
                    {title}
                </h1>
                {subtitle && (
                    <span className="max-w-xl text-[14.5px] leading-relaxed text-muted">
                        {subtitle}
                    </span>
                )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

export { PageHeader };
