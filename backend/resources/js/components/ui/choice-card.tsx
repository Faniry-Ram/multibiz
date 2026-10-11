import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function ChoiceCard({
    icon: Icon,
    title,
    description,
    meta,
    bullets,
    selected,
    disabled,
    onSelect,
    className,
}: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    meta?: string;
    bullets?: string[];
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={onSelect}
            className={cn(
                'flex flex-col gap-2.5 rounded-[14px] p-4.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55',
                selected
                    ? 'bg-primary-soft shadow-[inset_0_0_0_2px_var(--primary)]'
                    : 'bg-bg shadow-[inset_0_0_0_1px_var(--border)]',
                className,
            )}
        >
            {Icon && (
                <div className="flex items-start justify-between gap-2.5">
                    <span
                        className={cn(
                            'grid size-[42px] place-items-center rounded-[11px]',
                            selected
                                ? 'bg-primary text-white'
                                : 'bg-surface2 text-text2',
                        )}
                    >
                        <Icon className="size-[22px]" aria-hidden="true" />
                    </span>
                    <span
                        className={cn(
                            'grid size-5 shrink-0 place-items-center rounded-full border-2',
                            selected ? 'border-primary' : 'border-c3',
                        )}
                    >
                        {selected && (
                            <span className="size-2.5 rounded-full bg-primary" />
                        )}
                    </span>
                </div>
            )}
            <span className="text-[17px] font-bold tracking-[-0.02em]">
                {title}
            </span>
            {description && (
                <span className="text-[13.5px] leading-relaxed text-text2">
                    {description}
                </span>
            )}
            {meta && (
                <span className="num text-[11.5px] text-muted">ex. {meta}</span>
            )}
            {bullets && bullets.length > 0 && (
                <span className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                    {bullets.map((bullet) => (
                        <span
                            key={bullet}
                            className="flex items-center gap-1.5 text-[12.5px] text-text2"
                        >
                            <Check
                                aria-hidden="true"
                                className="size-[13px] shrink-0 text-primary-text"
                                strokeWidth={2.6}
                            />
                            {bullet}
                        </span>
                    ))}
                </span>
            )}
        </button>
    );
}

export { ChoiceCard };
