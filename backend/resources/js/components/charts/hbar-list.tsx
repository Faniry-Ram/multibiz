export interface HBarListRow {
    label: string;
    value: number;
    displayValue: string;
    color?: string;
}

interface HBarListProps {
    ariaLabel: string;
    rows: HBarListRow[];
    max?: number;
    barColor?: string;
    labelWidth?: number;
    valueWidth?: number;
}

export function HBarList({
    ariaLabel,
    rows,
    max,
    barColor = 'var(--chart)',
    labelWidth = 110,
    valueWidth = 70,
}: HBarListProps) {
    const maxValue = max ?? Math.max(...rows.map((r) => r.value), 1);

    return (
        <div
            role="img"
            aria-label={ariaLabel}
            className="flex flex-col gap-2.5"
        >
            {rows.map((row, i) => (
                <div
                    key={i}
                    className="grid items-center gap-2.5"
                    style={{
                        gridTemplateColumns: `${labelWidth}px 1fr ${valueWidth}px`,
                    }}
                >
                    <span className="truncate font-mono text-xs text-muted">
                        {row.label}
                    </span>
                    <span className="block h-3.5 rounded bg-surface2">
                        <span
                            className="block h-full rounded"
                            style={{
                                width: `${(row.value / maxValue) * 100}%`,
                                background: row.color ?? barColor,
                            }}
                        />
                    </span>
                    <span className="text-right font-mono text-[13px]">
                        {row.displayValue}
                    </span>
                </div>
            ))}
        </div>
    );
}
