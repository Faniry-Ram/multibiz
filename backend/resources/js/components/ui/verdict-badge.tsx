import * as React from 'react';

import { cn } from '@/lib/utils';

export type VerdictTone = 'pos' | 'neg' | 'warn' | 'primary' | 'slate';

const TONE_CLASSES: Record<VerdictTone, string> = {
    pos: 'bg-pos-soft text-pos',
    neg: 'bg-neg-soft text-neg',
    warn: 'bg-warn-soft text-warn',
    primary: 'bg-primary-soft text-primary-text',
    slate: 'bg-slate-soft text-slate-text',
};

function VerdictBadge({
    tone,
    className,
    ...props
}: React.ComponentProps<'span'> & { tone: VerdictTone }) {
    return (
        <span
            data-slot="verdict-badge"
            className={cn(
                'inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                TONE_CLASSES[tone],
                className,
            )}
            {...props}
        />
    );
}

export { VerdictBadge };
