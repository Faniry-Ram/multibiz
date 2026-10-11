export interface WeekStripDay {
    weekday: string;
    dayNumber: string;
    isToday: boolean;
    dots: string[];
    count: string;
}

interface WeekStripProps {
    ariaLabel: string;
    days: WeekStripDay[];
}

export function WeekStrip({ ariaLabel, days }: WeekStripProps) {
    return (
        <div
            role="img"
            aria-label={ariaLabel}
            className="grid grid-cols-7 gap-2"
        >
            {days.map((day, i) => (
                <div
                    key={i}
                    className={
                        day.isToday
                            ? 'flex flex-col gap-1 rounded-2xl bg-primary p-3.5 text-white'
                            : 'flex flex-col gap-1 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow)]'
                    }
                >
                    <span
                        className={`font-mono text-[11.5px] ${day.isToday ? 'text-primary-foreground/80' : 'text-muted'}`}
                    >
                        {day.weekday}
                    </span>
                    <span className="text-[22px] leading-none font-bold tracking-tight">
                        {day.dayNumber}
                    </span>
                    <span className="flex min-h-[7px] gap-[3px]">
                        {day.dots.map((color, j) => (
                            <span
                                key={j}
                                className="size-[7px] rounded-sm"
                                style={{ background: color }}
                            />
                        ))}
                    </span>
                    <span
                        className={`text-xs ${day.isToday ? 'text-primary-foreground/80' : 'text-muted'}`}
                    >
                        {day.count}
                    </span>
                </div>
            ))}
        </div>
    );
}
