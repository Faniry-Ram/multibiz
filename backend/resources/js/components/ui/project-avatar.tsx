import * as React from 'react';

import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
    sm: 'size-[44px] rounded-xl text-base',
    lg: 'size-14 rounded-2xl text-xl',
} as const;

function ProjectAvatar({
    initials,
    color,
    size = 'sm',
    className,
}: {
    initials: string;
    color: string;
    size?: keyof typeof SIZE_CLASSES;
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            data-slot="project-avatar"
            className={cn(
                'num grid shrink-0 place-items-center font-medium text-white',
                SIZE_CLASSES[size],
                className,
            )}
            style={{ background: color }}
        >
            {initials}
        </div>
    );
}

function ProjectDot({
    color,
    className,
}: {
    color: string;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            data-slot="project-dot"
            className={cn('size-[9px] shrink-0 rounded-[3px]', className)}
            style={{ background: color }}
        />
    );
}

export { ProjectAvatar, ProjectDot };
