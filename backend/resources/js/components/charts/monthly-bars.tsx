export interface MonthlyBarsMilestone {
    n: string;
    ariaLabel: string;
    selected: boolean;
    onSelect: () => void;
    color: string;
}

export interface MonthlyBarsMonth {
    label: string;
    inValue: number;
    outValue: number;
    inTitle: string;
    outTitle: string;
    result: string;
    resultPositive: boolean;
    milestone?: MonthlyBarsMilestone;
}

interface MonthlyBarsProps {
    ariaLabel: string;
    months: MonthlyBarsMonth[];
    maxValue: number;
    colorIn?: string;
    colorOut?: string;
    barsHeight?: number;
    columnHeight?: number;
}

export function MonthlyBars({
    ariaLabel,
    months,
    maxValue,
    colorIn = 'var(--chart)',
    colorOut = 'var(--c2)',
    barsHeight = 170,
    columnHeight = 250,
}: MonthlyBarsProps) {
    return (
        <div className="flex flex-col gap-0">
            <div
                role="img"
                aria-label={ariaLabel}
                className="grid items-end gap-3.5 border-b border-border"
                style={{
                    gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`,
                    height: columnHeight,
                }}
            >
                {months.map((month, i) => (
                    <div
                        key={i}
                        className="flex h-full flex-col items-center justify-end gap-2"
                    >
                        {month.milestone ? (
                            <button
                                type="button"
                                aria-label={month.milestone.ariaLabel}
                                aria-pressed={month.milestone.selected}
                                onClick={month.milestone.onSelect}
                                className="grid size-6 place-items-center rounded-full font-mono text-[11.5px] text-white"
                                style={{
                                    background: month.milestone.color,
                                    boxShadow: `0 0 0 3px ${month.milestone.selected ? 'var(--text)' : 'var(--surface)'}`,
                                }}
                            >
                                {month.milestone.n}
                            </button>
                        ) : (
                            <span className="size-6" aria-hidden />
                        )}
                        <span
                            className="font-mono text-xs font-medium"
                            style={{
                                color: month.resultPositive
                                    ? 'var(--pos)'
                                    : 'var(--warn)',
                            }}
                        >
                            {month.result}
                        </span>
                        <div
                            className="flex w-full items-end justify-center gap-1"
                            style={{ height: barsHeight }}
                        >
                            <span
                                title={month.inTitle}
                                className="block w-[30%] max-w-10 rounded-t-[4px]"
                                style={{
                                    background: colorIn,
                                    height: `${(month.inValue / maxValue) * 100}%`,
                                }}
                            />
                            <span
                                title={month.outTitle}
                                className="block w-[30%] max-w-10 rounded-t-[4px]"
                                style={{
                                    background: colorOut,
                                    height: `${(month.outValue / maxValue) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div
                aria-hidden
                className="-mt-1.5 grid gap-3.5"
                style={{
                    gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`,
                }}
            >
                {months.map((month, i) => (
                    <span
                        key={i}
                        className="text-center font-mono text-[11.5px] text-muted"
                    >
                        {month.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
