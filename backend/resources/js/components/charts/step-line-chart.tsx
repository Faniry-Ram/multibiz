export interface StepLineEvent {
    day: number;
    qty: number;
    kind: 'death' | 'sale';
}

export interface StepLineYTick {
    value: number;
    label: string;
}

interface StepLineChartProps {
    ariaLabel: string;
    domain: { xMax: number; yMax: number };
    height?: number;
    start: number;
    events: StepLineEvent[];
    projection?: { currentDay: number; planDay: number };
    saleTagLabel?: (qty: number) => string;
    yTicks: StepLineYTick[];
}

export function StepLineChart({
    ariaLabel,
    domain,
    height = 190,
    start,
    events,
    projection,
    saleTagLabel = (qty) => `vente ${qty}`,
    yTicks,
}: StepLineChartProps) {
    const px = (x: number) => (x / domain.xMax) * 1000;
    const py = (y: number) => height - (y / domain.yMax) * height;
    const xp = (x: number) => (x / domain.xMax) * 100;
    const yp = (y: number) => (1 - y / domain.yMax) * 100;

    const sorted = [...events].sort((a, b) => a.day - b.day);
    let current = start;
    const points: [number, number][] = [[0, current]];
    const deathMarks: { day: number; y: number }[] = [];
    const saleTags: { day: number; y: number; label: string }[] = [];

    sorted.forEach(({ day, qty, kind }) => {
        points.push([day, current]);
        current -= qty;
        points.push([day, current]);
        if (kind === 'death') {
            deathMarks.push({ day, y: current + 1 });
        } else {
            saleTags.push({ day, y: current + qty, label: saleTagLabel(qty) });
        }
    });

    let projectionLine: [number, number][] | null = null;
    let todayMark: { day: number; y: number } | null = null;
    if (projection) {
        points.push([projection.currentDay, current]);
        projectionLine = [
            [projection.currentDay, current],
            [projection.planDay, current],
            [projection.planDay, 0],
        ];
        todayMark = { day: projection.currentDay, y: current };
    }

    const line = points
        .map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`)
        .join(' ');
    const lastDay = points[points.length - 1][0];
    const area = `0,${height} ${line} ${px(lastDay).toFixed(1)},${height}`;

    return (
        <div role="img" aria-label={ariaLabel} className="flex gap-2.5">
            <div
                className="relative w-[30px] flex-none"
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
                <svg
                    width="100%"
                    height={height}
                    viewBox={`0 0 1000 ${height}`}
                    preserveAspectRatio="none"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'visible',
                    }}
                >
                    <polygon
                        points={area}
                        style={{ fill: 'rgba(var(--heat), 0.10)' }}
                    />
                    <polyline
                        points={line}
                        fill="none"
                        style={{ stroke: 'var(--chart)' }}
                        strokeWidth={2.2}
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                    />
                    {projectionLine && (
                        <polyline
                            points={projectionLine
                                .map(
                                    ([x, y]) =>
                                        `${px(x).toFixed(1)},${py(y).toFixed(1)}`,
                                )
                                .join(' ')}
                            fill="none"
                            style={{ stroke: 'var(--chart)' }}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            opacity={0.7}
                            vectorEffect="non-scaling-stroke"
                        />
                    )}
                </svg>
                {deathMarks.map((m, i) => (
                    <span
                        key={i}
                        aria-hidden
                        title={`Mort à J${m.day}`}
                        className="absolute size-2 rounded-full"
                        style={{
                            left: `calc(${xp(m.day)}% - 4px)`,
                            top: `calc(${yp(m.y)}% - 4px)`,
                            background: 'var(--neg)',
                            boxShadow: '0 0 0 2px var(--surface)',
                        }}
                    />
                ))}
                {saleTags.map((t, i) => (
                    <span
                        key={i}
                        aria-hidden
                        className="absolute w-[46px] text-right font-mono text-[10.5px] font-medium whitespace-nowrap text-pos"
                        style={{
                            left: `calc(${xp(t.day)}% - 50px)`,
                            top: `calc(${yp(t.y)}% - 22px)`,
                        }}
                    >
                        {t.label}
                    </span>
                ))}
                {projection && (
                    <span
                        aria-hidden
                        className="absolute font-mono text-[10.5px] text-muted"
                        style={{
                            left: `calc(${xp(projection.planDay)}% - 118px)`,
                            top: `calc(${yp(current)}% - 22px)`,
                            width: 112,
                            textAlign: 'right',
                        }}
                    >
                        vente prévue J{projection.planDay}
                    </span>
                )}
                {todayMark && (
                    <span
                        aria-hidden
                        title={`Aujourd'hui, J${todayMark.day}`}
                        className="absolute size-2.5 rounded-full"
                        style={{
                            left: `calc(${xp(todayMark.day)}% - 5px)`,
                            top: `calc(${yp(todayMark.y)}% - 5px)`,
                            background: 'var(--chart)',
                            boxShadow: '0 0 0 3px rgba(var(--heat), 0.25)',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
