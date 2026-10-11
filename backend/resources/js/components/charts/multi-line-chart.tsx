import type { ReactNode } from 'react';

export interface LineChartDomain {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export type LinePoint = { x: number; y: number } | null;

export interface LineSeries {
    name: string;
    color: string;
    points: LinePoint[];
    strokeWidth?: number;
    dots?: boolean;
    endLabel?: string;
}

export interface LineChartYTick {
    value: number;
    label: string;
}

interface MultiLineChartProps {
    ariaLabel: string;
    domain: LineChartDomain;
    height?: number;
    series: LineSeries[];
    yTicks?: LineChartYTick[];
    zeroDashed?: boolean;
    hoverIndex?: number;
    onHoverIndex?: (x: number) => void;
    hoverColumns?: number;
    tooltip?: ReactNode;
    tooltipClampMin?: number;
    tooltipClampMax?: number;
}

export function MultiLineChart({
    ariaLabel,
    domain,
    height = 260,
    series,
    yTicks = [],
    zeroDashed = false,
    hoverIndex,
    onHoverIndex,
    hoverColumns,
    tooltip,
    tooltipClampMin = 14,
    tooltipClampMax = 70,
}: MultiLineChartProps) {
    const spanX = domain.x1 - domain.x0 || 1;
    const spanY = domain.y1 - domain.y0 || 1;
    const px = (x: number) => ((x - domain.x0) / spanX) * 1000;
    const py = (y: number) => height - ((y - domain.y0) / spanY) * height;
    const xp = (x: number) => ((x - domain.x0) / spanX) * 100;
    const yp = (y: number) => (1 - (y - domain.y0) / spanY) * 100;

    const linesWith = (p: LinePoint[]) =>
        p
            .map((pt) =>
                pt === null
                    ? null
                    : `${px(pt.x).toFixed(1)},${py(pt.y).toFixed(1)}`,
            )
            .filter((v): v is string => v !== null)
            .join(' ');

    const columns = hoverColumns ?? series[0]?.points.length ?? 0;
    const hoverLeft = hoverIndex !== undefined ? xp(hoverIndex) : null;
    const tipLeft =
        hoverLeft !== null
            ? Math.min(Math.max(hoverLeft, tooltipClampMin), tooltipClampMax)
            : null;

    return (
        <div role="img" aria-label={ariaLabel} className="flex gap-2.5">
            {yTicks.length > 0 && (
                <div
                    className="relative w-12 flex-none"
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
            )}
            <div className="relative min-w-0 flex-1" style={{ height }}>
                {yTicks.map((tick) => (
                    <span
                        key={tick.value}
                        aria-hidden
                        className="absolute inset-x-0"
                        style={{
                            top: `${yp(tick.value)}%`,
                            borderTop:
                                zeroDashed && tick.value === 0
                                    ? '1px dashed var(--c2)'
                                    : '1px solid var(--border)',
                        }}
                    />
                ))}
                {hoverLeft !== null && (
                    <span
                        aria-hidden
                        className="absolute inset-y-0 w-px"
                        style={{
                            left: `${hoverLeft}%`,
                            background: 'var(--c2)',
                        }}
                    />
                )}
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
                    {series.map((s) => (
                        <polyline
                            key={s.name}
                            points={linesWith(s.points)}
                            fill="none"
                            style={{ stroke: s.color }}
                            strokeWidth={s.strokeWidth ?? 2.4}
                            vectorEffect="non-scaling-stroke"
                            strokeLinejoin="round"
                        />
                    ))}
                </svg>
                {series.map((s) =>
                    s.dots
                        ? s.points.map((pt, i) =>
                              pt === null ? null : (
                                  <span
                                      key={`${s.name}-${i}`}
                                      aria-hidden
                                      className="absolute size-2 rounded-full"
                                      style={{
                                          left: `calc(${xp(pt.x)}% - 4px)`,
                                          top: `calc(${yp(pt.y)}% - 4px)`,
                                          background: s.color,
                                          boxShadow: '0 0 0 2px var(--surface)',
                                      }}
                                  />
                              ),
                          )
                        : null,
                )}
                {hoverIndex !== undefined &&
                    series.map((s) => {
                        const pt = s.points[hoverIndex] ?? null;
                        if (pt === null) return null;
                        return (
                            <span
                                key={`hover-${s.name}`}
                                aria-hidden
                                className="absolute size-3 rounded-full"
                                style={{
                                    left: `calc(${xp(pt.x)}% - 6px)`,
                                    top: `calc(${yp(pt.y)}% - 6px)`,
                                    background: s.color,
                                    boxShadow: '0 0 0 2px var(--surface)',
                                }}
                            />
                        );
                    })}
                {series.map((s) => {
                    if (!s.endLabel) return null;
                    const last = [...s.points]
                        .reverse()
                        .find((pt) => pt !== null);
                    if (!last) return null;
                    return (
                        <span
                            key={`end-${s.name}`}
                            aria-hidden
                            className="absolute -top-0 right-0 rounded bg-surface px-1 py-px font-mono text-[11px] font-medium whitespace-nowrap text-text2"
                            style={{
                                top: `calc(${yp(last.y)}% - 22px)`,
                                right: -6,
                            }}
                        >
                            {s.endLabel}
                        </span>
                    );
                })}
                {tipLeft !== null && tooltip && (
                    <div
                        className="pointer-events-none absolute top-1 flex min-w-[230px] -translate-x-1/2 flex-col gap-1 rounded-[10px] border border-border bg-surface p-2.5 shadow-[var(--shadow)]"
                        style={{ left: `${tipLeft}%` }}
                    >
                        {tooltip}
                    </div>
                )}
                {onHoverIndex && columns > 0 && (
                    <div className="absolute inset-0 flex">
                        {Array.from(
                            { length: columns },
                            (_, i) => domain.x0 + i,
                        ).map((x) => (
                            <button
                                key={x}
                                type="button"
                                aria-label={`Voir le détail à ${x}`}
                                onMouseEnter={() => onHoverIndex(x)}
                                onFocus={() => onHoverIndex(x)}
                                className="h-full flex-1 cursor-crosshair"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
