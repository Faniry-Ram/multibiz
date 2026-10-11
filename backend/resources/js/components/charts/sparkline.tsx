export type SparklinePoint = [x: number, y: number];

interface SparklineProps {
    points: SparklinePoint[];
    color: string;
    ariaLabel: string;
    className?: string;
}

export function Sparkline({
    points,
    color,
    ariaLabel,
    className,
}: SparklineProps) {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(0, ...ys);
    const y1 = Math.max(0, ...ys);
    const pad = (y1 - y0) * 0.15;
    const lo = y0 - pad;
    const hi = y1 + pad;
    const spanX = x1 - x0 || 1;
    const spanY = hi - lo || 1;

    const mapY = (v: number) => 64 - ((v - lo) / spanY) * 64;
    const spark = points
        .map(
            ([x, y]) =>
                `${(((x - x0) / spanX) * 300).toFixed(1)},${mapY(y).toFixed(1)}`,
        )
        .join(' ');
    const zeroPct = (mapY(0) / 64) * 100;
    const showZero = zeroPct >= 0 && zeroPct <= 100;

    return (
        <div
            role="img"
            aria-label={ariaLabel}
            className={className}
            style={{ position: 'relative', height: 64 }}
        >
            {showZero && (
                <span
                    aria-hidden
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${zeroPct}%`,
                        borderTop: '1px dashed var(--c2)',
                    }}
                />
            )}
            <svg
                width="100%"
                height="64"
                viewBox="0 0 300 64"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
                <polyline
                    points={spark}
                    fill="none"
                    style={{ stroke: color }}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
