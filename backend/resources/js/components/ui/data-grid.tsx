import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A CSS-grid table: pass `columns` as a `grid-template-columns` value and lay
 * out each cell yourself. Used for the aligned-numbers tables across
 * Historique, Lots, Poche, Analyse (see docs/maquette/README.md §3 "DataRow").
 */
function DataGridHeader({
    columns,
    children,
    className,
}: {
    columns: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'num grid gap-3 border-b border-border py-2.5 text-[11.5px] text-muted',
                className,
            )}
            style={{ gridTemplateColumns: columns }}
        >
            {children}
        </div>
    );
}

function DataGridRow({
    columns,
    children,
    className,
    as: Comp = 'div',
    ...props
}: {
    columns: string;
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
    return (
        <Comp
            className={cn(
                'grid items-center gap-3 border-b border-border py-3 text-sm',
                className,
            )}
            style={{ gridTemplateColumns: columns }}
            {...props}
        >
            {children}
        </Comp>
    );
}

export { DataGridHeader, DataGridRow };
