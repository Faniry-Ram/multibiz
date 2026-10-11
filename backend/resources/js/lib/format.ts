/**
 * Formatting helpers for the French UI — amounts, percentages, dates.
 * See docs/maquette/README.md section 2 ("Nombres") for the exact target output.
 */

const THIN_SPACE = ' ';
const MINUS = '−';

function groupThousands(value: number): string {
    return Math.round(Math.abs(value))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
}

/** "1 250 000" — unsigned, grouped by thousands with a thin space. */
export function formatAmount(value: number): string {
    return groupThousands(value);
}

/** "1 250 000 Ar" — unsigned amount with the currency suffix. */
export function formatAr(value: number, currency = 'Ar'): string {
    return `${formatAmount(value)}${THIN_SPACE}${currency}`;
}

/**
 * "+ 476 000" / "− 120 000" — signed amount with the real minus sign (U+2212).
 * Pass `currency` to append the unit, e.g. formatSignedAr(-45000, true) → "− 45 000 Ar".
 */
export function formatSignedAr(
    value: number,
    currency: string | false = false,
): string {
    const sign = value < 0 ? MINUS : '+';
    const suffix = currency ? `${THIN_SPACE}${currency}` : '';

    return `${sign}${THIN_SPACE}${formatAmount(value)}${suffix}`;
}

/** "73 %" — rounded percentage with a thin space before the sign. */
export function formatPercent(value: number): string {
    return `${Math.round(value)}${THIN_SPACE}%`;
}

function toDate(value: Date | string): Date {
    return typeof value === 'string' ? new Date(value) : value;
}

/** "sam. 10 oct." */
export function formatDate(value: Date | string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(toDate(value));
}

/** "3 nov." — without the weekday, for compact mentions. */
export function formatShortDate(value: Date | string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(toDate(value));
}

/** Age of a batch/lot in days since it started: "J21". */
export function formatLotAge(days: number): string {
    return `J${Math.round(days)}`;
}

/** Days remaining before a deadline: "J−36". */
export function formatDueIn(daysRemaining: number): string {
    const days = Math.round(daysRemaining);

    return days < 0 ? `J+${Math.abs(days)}` : `J${MINUS}${days}`;
}

/** "à l'instant" / "il y a 2 min" / "il y a 3 h" / "il y a 5 j" */
export function formatRelativeTime(
    value: Date | string,
    now: Date = new Date(),
): string {
    const date = toDate(value);
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 45) {
        return "à l'instant";
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `il y a ${diffMinutes} min`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
        return `il y a ${diffHours} h`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
        return `il y a ${diffDays} j`;
    }

    return formatShortDate(date);
}
