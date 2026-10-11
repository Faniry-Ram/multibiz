import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function InfoNote({
    icon: Icon = Info,
    children,
    className,
}: {
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p
            data-slot="info-note"
            className={cn(
                'm-0 flex items-start gap-2.5 rounded-xl bg-primary-soft p-3.5 text-[13.5px] leading-relaxed text-text2',
                className,
            )}
        >
            <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary-text"
            />
            <span>{children}</span>
        </p>
    );
}

export { InfoNote };
