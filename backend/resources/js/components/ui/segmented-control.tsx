import * as React from 'react';

import { cn } from '@/lib/utils';

function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    'aria-label': ariaLabel,
    className,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    'aria-label': string;
    className?: string;
}) {
    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className={cn(
                'inline-flex gap-1 rounded-[11px] bg-surface p-1 border border-border',
                className,
            )}
        >
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'h-9 rounded-[8px] px-3.5 text-[13.5px] font-semibold transition-colors',
                            selected
                                ? 'bg-primary-soft text-primary-text'
                                : 'text-text2 hover:text-text',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export { SegmentedControl };
