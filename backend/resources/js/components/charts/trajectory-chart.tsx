export interface TrajectoryDomain {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export interface TrajectoryYTick {
    value: number;
    label: string;
}

export interface TrajectoryXTick {
    x: number;
    label: string;
}

export interface TrajectorySaleTag {
    x: number;
    y: number;
    label: string;
}

export interface TrajectoryMarker {
    id: string;
    x: number;
    y: number;
    label: string;
    ariaLabel: string;
    color: string;
    selected: boolean;
    onSelect: () => void;
}

interface TrajectoryChartProps {
    ariaLabel: string;
    domain: TrajectoryDomain;
    height?: number;
    realPoints: [number, number][];
    projectionPoints?: [number, number][];
    yTicks: TrajectoryYTick[];
    saleTags?: TrajectorySaleTag[];
    markers?: TrajectoryMarker[];
    zeroLabel?: string;
}

export function TrajectoryChart({
    ariaLabel,
    domain,
    height = 260,
    realPoints,
    projectionPoints,
    yTicks,
    saleTags = [],
    markers = [],
    zeroLabel = 'point mort',
}: TrajectoryChartProps) {
    const spanX = domain.x1 - domain.x0 || 1;
    const spanY = domain.y1 - domain.y0 || 1;
    const px = (d: number) => ((d - domain.x0) / spanX) * 1000;
    const py = (v: number) => height - ((v - domain.y0) / spanY) * height;
    const xp = (d: number) => ((d - domain.x0) / spanX) * 100;
    const yp = (v: number) => (1 - (v - domain.y0) / spanY) * 100;
    const join = (pts: [number, number][]) =>
        pts
            .map(([d, v]) => `${px(d).toFixed(1)},${py(v).toFixed(1)}`)
            .join(' ');

    const realPts = join(realPoints);
    const zeroY = py(0).toFixed(1);
    const firstX = px(realPoints[0]?.[0] ?? domain.x0).toFixed(1);
    const lastX = px(
        realPoints[realPoints.length - 1]?.[0] ?? domain.x1,
    ).toFixed(1);
    const areaPts = `${firstX},${zeroY} ${realPts} ${lastX},${zeroY}`;

    return (
        <div role="img" aria-label={ariaLabel} className="flex gap-2.5">
            <div
                className="relative w-[52px] flex-none"
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
                        className="absolute inset-x-0"
                        style={{
                            top: `${yp(tick.value)}%`,
                            borderTop:
                                tick.value === 0
                                    ? '1px dashed var(--c2)'
                                    : '1px solid var(--border)',
                        }}
                    />
                ))}
                <span
                    aria-hidden
                    className="absolute font-mono text-[10.5px] text-muted"
                    style={{ left: 6, top: `calc(${yp(0)}% - 17px)` }}
                >
                    {zeroLabel}
                </span>
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
                        points={areaPts}
                        style={{ fill: 'rgba(var(--heat), 0.08)' }}
                    />
                    {projectionPoints && (
                        <polyline
                            points={join(projectionPoints)}
                            fill="none"
                            style={{ stroke: 'var(--chart)' }}
                            strokeWidth={2}
                            strokeDasharray="6 5"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}
                    <polyline
                        points={realPts}
                        fill="none"
                        style={{ stroke: 'var(--chart)' }}
                        strokeWidth={2.2}
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                    />
                </svg>
                {saleTags.map((tag, i) => (
                    <span
                        key={i}
                        aria-hidden
                        className="absolute -translate-x-1/2 font-mono text-[10.5px] whitespace-nowrap text-pos"
                        style={{
                            left: `${xp(tag.x)}%`,
                            top: `calc(${yp(tag.y)}% - 24px)`,
                        }}
                    >
                        {tag.label}
                    </span>
                ))}
                {markers.map((marker) => (
                    <button
                        key={marker.id}
                        type="button"
                        aria-label={marker.ariaLabel}
                        aria-pressed={marker.selected}
                        onClick={marker.onSelect}
                        className="absolute grid size-6 place-items-center rounded-full font-mono text-[11.5px] font-medium text-white"
                        style={{
                            left: `calc(${xp(marker.x)}% - 12px)`,
                            top: `calc(${yp(marker.y)}% - 12px)`,
                            background: marker.color,
                            boxShadow: `0 0 0 3px ${marker.selected ? 'var(--text)' : 'var(--surface)'}`,
                        }}
                    >
                        {marker.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function TrajectoryXAxis({
    domain,
    xTicks,
    labelColumnWidth = 62,
}: {
    domain: TrajectoryDomain;
    xTicks: TrajectoryXTick[];
    labelColumnWidth?: number;
}) {
    const spanX = domain.x1 - domain.x0 || 1;
    const xp = (d: number) => ((d - domain.x0) / spanX) * 100;

    return (
        <div
            aria-hidden
            className="relative h-4"
            style={{ marginLeft: labelColumnWidth }}
        >
            {xTicks.map((tick) => (
                <span
                    key={tick.x}
                    className="absolute -translate-x-[10%] font-mono text-[11.5px] whitespace-nowrap text-muted"
                    style={{ left: `${xp(tick.x)}%` }}
                >
                    {tick.label}
                </span>
            ))}
        </div>
    );
}
