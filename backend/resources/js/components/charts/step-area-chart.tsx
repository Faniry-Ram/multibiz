export interface StepAreaEvent {
    x: number;
    y: number;
}

export interface StepAreaTag {
    x: number;
    y: number;
    label: string;
    color: string;
}

export interface StepAreaYTick {
    value: number;
    label: string;
}

interface StepAreaChartProps {
    ariaLabel: string;
    domain: { x1: number; y1: number };
    height?: number;
    events: StepAreaEvent[];
    startX?: number;
    endX?: number;
    yTicks: StepAreaYTick[];
    tags?: StepAreaTag[];
}

export function StepAreaChart({
    ariaLabel,
    domain,
    height = 220,
    events,
    startX,
    endX = domain.x1,
    yTicks,
    tags = [],
}: StepAreaChartProps) {
    const px = (x: number) => (x / domain.x1) * 1000;
    const py = (y: number) => height - (y / domain.y1) * height;
    const xp = (x: number) => (x / domain.x1) * 100;
    const yp = (y: number) => (1 - y / domain.y1) * 100;

    const points: [number, number][] = [];
    events.forEach(({ x, y }, i) => {
        if (i > 0) points.push([x, events[i - 1].y]);
        points.push([x, y]);
    });
    const lastEvent = events[events.length - 1];
    if (lastEvent && endX > lastEvent.x) {
        points.push([endX, lastEvent.y]);
    }

    const step = points
        .map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`)
        .join(' ');
    const firstX = px(startX ?? events[0]?.x ?? 0).toFixed(1);
    const lastX = px(endX).toFixed(1);
    const area = `${firstX},${height} ${step} ${lastX},${height}`;

    return (
        <div role="img" aria-label={ariaLabel} className="flex gap-2.5">
            <div
                className="relative w-14 flex-none"
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
                        points={step}
                        fill="none"
                        style={{ stroke: 'var(--chart)' }}
                        strokeWidth={2.2}
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                    />
                </svg>
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        aria-hidden
                        className="absolute font-mono text-[10.5px] font-medium whitespace-nowrap"
                        style={{
                            left: `calc(${xp(tag.x)}% + 4px)`,
                            top: `calc(${yp(tag.y)}% - 20px)`,
                            color: tag.color,
                        }}
                    >
                        {tag.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
