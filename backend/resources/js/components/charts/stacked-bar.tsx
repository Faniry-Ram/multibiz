export interface StackedBarSegment {
    label: string;
    value: number;
    color: string;
}

interface StackedBarProps {
    ariaLabel: string;
    segments: StackedBarSegment[];
}

export function StackedBar({ ariaLabel, segments }: StackedBarProps) {
    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

    return (
        <div
            role="img"
            aria-label={ariaLabel}
            className="flex h-3 gap-0.5 overflow-hidden rounded"
        >
            {segments.map((segment) => (
                <span
                    key={segment.label}
                    className="block h-full"
                    style={{
                        width: `${(segment.value / total) * 100}%`,
                        background: segment.color,
                    }}
                />
            ))}
        </div>
    );
}
