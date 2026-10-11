export interface DivergingBarsRow {
    name: string;
    color: string;
    value: number;
    displayValue: string;
    valueColor?: string;
}

interface DivergingBarsProps {
    ariaLabel: string;
    rows: DivergingBarsRow[];
    maxAbs: number;
    thresholdPosition?: number;
    positiveColor?: string;
    negativeColor?: string;
}

export function DivergingBars({
    ariaLabel,
    rows,
    maxAbs,
    thresholdPosition = 0.7,
    positiveColor = 'var(--chart)',
    negativeColor = 'var(--neg)',
}: DivergingBarsProps) {
    return (
        <div role="img" aria-label={ariaLabel} className="flex flex-col gap-3">
            {rows.map((row) => (
                <div
                    key={row.name}
                    className="grid grid-cols-[130px_1fr_92px] items-center gap-3"
                >
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                        <span
                            className="size-2 rounded-sm"
                            style={{ background: row.color }}
                        />
                        {row.name}
                    </span>
                    <span className="relative flex h-4">
                        <span className="flex flex-1 justify-end">
                            {row.value < 0 && (
                                <span
                                    className="block rounded-l-[4px]"
                                    style={{
                                        background: negativeColor,
                                        width: `${(-row.value / maxAbs) * 100}%`,
                                    }}
                                />
                            )}
                        </span>
                        <span className="flex flex-1 border-l-[1.5px] border-c2">
                            {row.value > 0 && (
                                <span
                                    className="block rounded-r-[4px]"
                                    style={{
                                        background: positiveColor,
                                        width: `${(row.value / maxAbs) * 100}%`,
                                    }}
                                />
                            )}
                        </span>
                        <span
                            aria-hidden
                            className="absolute -top-1 -bottom-1 border-l-2 border-dashed border-text2"
                            style={{ left: `${thresholdPosition * 100}%` }}
                        />
                    </span>
                    <span
                        className="text-right font-mono text-[13px]"
                        style={{ color: row.valueColor ?? 'var(--text)' }}
                    >
                        {row.displayValue}
                    </span>
                </div>
            ))}
        </div>
    );
}
