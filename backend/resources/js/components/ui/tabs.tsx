import { Link } from '@inertiajs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/** Underlined section tabs, e.g. the tab row on a project page. */
function Tabs({
    items,
    className,
}: {
    items: { label: string; href: string; current: boolean }[];
    className?: string;
}) {
    return (
        <div
            aria-label="Sections"
            className={cn(
                'flex gap-1 overflow-x-auto border-b border-border',
                className,
            )}
        >
            {items.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={cn(
                        'shrink-0 px-3.5 py-2.5 text-[14.5px] whitespace-nowrap',
                        item.current
                            ? 'border-b-2 border-primary font-semibold text-primary-text'
                            : 'text-text2 hover:text-text',
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
}

export { Tabs };
