import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            data-slot="empty-state"
            className={cn(
                'flex flex-col items-center gap-2 py-10 text-center',
                className,
            )}
        >
            {Icon && <Icon aria-hidden="true" className="mb-1 size-7 text-muted" />}
            <p className="text-[15px] font-medium text-text">{title}</p>
            {description && (
                <p className="max-w-sm text-sm text-muted">{description}</p>
            )}
            {action}
        </div>
    );
}

export { EmptyState };
