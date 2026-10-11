import * as React from 'react';

import { ProgressBar } from '@/components/ui/progress-bar';
import { VerdictBadge, type VerdictTone } from '@/components/ui/verdict-badge';
import { cn } from '@/lib/utils';

function GoalCard({
    title,
    badgeLabel,
    badgeTone,
    progress,
    progressColor,
    left,
    right,
    className,
}: {
    title: React.ReactNode;
    badgeLabel: string;
    badgeTone: VerdictTone;
    /** 0–100 */
    progress: number;
    progressColor?: string;
    left: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            data-slot="goal-card"
            className={cn(
                'flex flex-col gap-2 rounded-xl border border-border bg-bg p-3.5',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-2.5">
                <span className="text-sm font-semibold">{title}</span>
                <VerdictBadge tone={badgeTone} className="shrink-0">
                    {badgeLabel}
                </VerdictBadge>
            </div>
            <ProgressBar value={progress} color={progressColor ?? 'var(--pos)'} />
            <div className="num flex justify-between gap-2.5 text-xs text-muted">
                <span>{left}</span>
                {right && <span>{right}</span>}
            </div>
        </div>
    );
}

export { GoalCard };
