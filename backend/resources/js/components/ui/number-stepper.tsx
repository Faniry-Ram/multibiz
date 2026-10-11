import { Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function NumberStepper({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    className,
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    className?: string;
}) {
    const canDecrement = min === undefined || value - step >= min;
    const canIncrement = max === undefined || value + step <= max;

    return (
        <div
            data-slot="number-stepper"
            className={cn('inline-flex items-center gap-3', className)}
        >
            <button
                type="button"
                aria-label={label ? `Moins : ${label}` : 'Moins'}
                disabled={!canDecrement}
                onClick={() => onChange(Math.max(min ?? -Infinity, value - step))}
                className="flex size-[34px] items-center justify-center rounded-[9px] border border-border transition-colors hover:bg-surface2 disabled:pointer-events-none disabled:opacity-40"
            >
                <Minus className="size-4" />
            </button>
            <span className="num min-w-7 text-center text-xl font-medium">
                {value}
            </span>
            <button
                type="button"
                aria-label={label ? `Plus : ${label}` : 'Plus'}
                disabled={!canIncrement}
                onClick={() => onChange(Math.min(max ?? Infinity, value + step))}
                className="flex size-[34px] items-center justify-center rounded-[9px] border border-border transition-colors hover:bg-surface2 disabled:pointer-events-none disabled:opacity-40"
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}

export { NumberStepper };
