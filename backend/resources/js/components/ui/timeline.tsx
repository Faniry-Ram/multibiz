import * as React from 'react';

import { cn } from '@/lib/utils';

export type TimelineStepStatus = 'past' | 'now' | 'next';

const DOT_CLASSES: Record<TimelineStepStatus, string> = {
    past: 'bg-pos',
    now: 'bg-primary ring-[3px] ring-primary-soft',
    next: 'border-2 border-c3 bg-surface',
};

function Timeline({
    steps,
    className,
}: {
    steps: {
        day: string;
        text: string;
        date: string;
        status: TimelineStepStatus;
    }[];
    className?: string;
}) {
    return (
        <div
            className={cn('relative flex flex-col pl-4.5', className)}
        >
            <span
                aria-hidden="true"
                className="absolute top-2 bottom-2 left-1 w-0.5 bg-border"
            />
            {steps.map((step) => (
                <div
                    key={step.day}
                    className="relative flex items-baseline gap-2.5 py-1.5"
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute top-[11px] -left-[18px] size-2.5 rounded-full box-border',
                            DOT_CLASSES[step.status],
                        )}
                    />
                    <span className="num w-[34px] shrink-0 text-xs text-muted">
                        {step.day}
                    </span>
                    <span
                        className={cn(
                            'flex-1 text-[13.5px]',
                            step.status === 'now' && 'font-bold',
                            step.status === 'past' && 'text-muted',
                        )}
                    >
                        {step.text}
                    </span>
                    <span className="num text-[11.5px] text-muted">
                        {step.date}
                    </span>
                </div>
            ))}
        </div>
    );
}

export { Timeline };
