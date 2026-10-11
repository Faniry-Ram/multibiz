export interface PairedBarsDay {
    label: string;
    a: number;
    b: number;
    ariaLabel: string;
    selected?: boolean;
    onClick?: () => void;
}

export interface PairedBarsYTick {
    value: number;
    label: string;
}

interface PairedBarsProps {
    ariaLabel: string;
    days: PairedBarsDay[];
    colorA: string;
    colorB: string;
    yMax: number;
    target?: number;
    yTicks: PairedBarsYTick[];
    height?: number;
}

export function PairedBars({
    ariaLabel,
    days,
    colorA,
    colorB,
    yMax,
    target,
    yTicks,
    height = 230,
}: PairedBarsProps) {
    const yp = (v: number) => (1 - v / yMax) * 100;

    return (
        <div className="flex flex-col gap-1.5">
            <div role="img" aria-label={ariaLabel} className="flex gap-2.5">
                <div
                    className="relative w-[26px] flex-none"
                    style={{ height }}
                    aria-hidden
                >
                    {yTicks.map((tick) => (
                        <span
                            key={tick.value}
                            className="absolute right-0 font-mono text-[11px] text-muted"
                            style={{ top: `calc(${yp(tick.value)}% - 8px)` }}
                        >
                            {tick.label}
                        </span>
                    ))}
                </div>
                <div className="relative min-w-0 flex-1" style={{ height }}>
                    {yTicks.map((tick) => (
                        <span
                            key={tick.value}
                            aria-hidden
                            className="absolute inset-x-0 border-t border-border"
                            style={{ top: `${yp(tick.value)}%` }}
                        />
                    ))}
                    {target !== undefined && (
                        <span
                            aria-hidden
                            className="absolute inset-x-0 z-10 border-t-2 border-dashed opacity-60"
                            style={{
                                top: `${yp(target)}%`,
                                borderColor: 'var(--text2)',
                            }}
                        />
                    )}
                    <div className="absolute inset-0 flex gap-1.5">
                        {days.map((day, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={day.ariaLabel}
                                aria-pressed={day.selected}
                                onClick={day.onClick}
                                className="box-border flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-t-[6px] px-0.5"
                                style={{
                                    background: day.selected
                                        ? 'rgba(var(--heat), 0.08)'
                                        : undefined,
                                }}
                            >
                                <span
                                    className="block max-w-[18px] flex-1 rounded-t-[3px]"
                                    style={{
                                        background: colorA,
                                        height: `${(day.a / yMax) * 100}%`,
                                        minHeight: day.a === 0 ? 2 : undefined,
                                        opacity: day.a === 0 ? 0.5 : undefined,
                                    }}
                                />
                                <span
                                    className="block max-w-[18px] flex-1 rounded-t-[3px]"
                                    style={{
                                        background: colorB,
                                        height: `${(day.b / yMax) * 100}%`,
                                        minHeight: day.b === 0 ? 2 : undefined,
                                        opacity: day.b === 0 ? 0.5 : undefined,
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div aria-hidden className="flex gap-1.5 pl-[calc(26px+10px)]">
                {days.map((day, i) => (
                    <span
                        key={i}
                        className="min-w-0 flex-1 text-center font-mono text-[11px] whitespace-nowrap"
                        style={{
                            color: day.selected
                                ? 'var(--text)'
                                : 'var(--muted)',
                            fontWeight: day.selected ? 600 : 400,
                        }}
                    >
                        {day.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
