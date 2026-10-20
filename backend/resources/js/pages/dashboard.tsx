import { Head, Link, router } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { Sparkline, type SparklinePoint } from '@/components/charts/sparkline';
import { PageHeader } from '@/components/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { VerdictBadge, type VerdictTone } from '@/components/ui/verdict-badge';
import { formatAr, formatSignedAr } from '@/lib/format';
import { dashboard, history } from '@/routes';

type Period = 'all' | '6m' | '30d';

type SecondaryStat = { label: string; value: string };

type ProjectCard = {
    id: string;
    name: string;
    color: string;
    href: string;
    model_label: string;
    since_label: string;
    verdict_label: string;
    verdict_tone: VerdictTone;
    capital_recovered_percent: number;
    trajectory: SparklinePoint[];
    result: number;
    secondary_stat: SecondaryStat | null;
    last_milestone: { date_label: string; text: string } | null;
};

type RecentEntry = {
    id: string;
    project_name: string;
    project_color: string;
    type: string;
    label: string;
    amount: number | null;
    quantity: number | null;
    headcount_delta: number | null;
    time_label: string;
};

type Balance = {
    capital_engaged: number;
    projects_count: number;
    result: number;
    capital_recovered_percent: number;
    capital_remaining: number;
    hours_invested: number;
    per_hour_formatted: string;
};

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: 'all', label: 'Depuis le début' },
    { value: '6m', label: '6 mois' },
    { value: '30d', label: '30 jours' },
];

const ENTRY_BADGE: Record<string, { label: string; tone: VerdictTone }> = {
    sale: { label: 'Vente', tone: 'pos' },
    expense: { label: 'Dépense', tone: 'neg' },
    investment: { label: 'Investissement', tone: 'primary' },
    owner_in: { label: 'Poche', tone: 'primary' },
    owner_out: { label: 'Poche', tone: 'primary' },
    headcount: { label: 'Effectif', tone: 'slate' },
    production: { label: 'Effectif', tone: 'slate' },
    note: { label: 'Note', tone: 'warn' },
};

const VALUE_COLOR: Record<VerdictTone, string> = {
    pos: 'var(--pos)',
    neg: 'var(--neg)',
    warn: 'var(--warn)',
    primary: 'var(--primary-text)',
    slate: 'var(--text2)',
};

function entryValueLabel(entry: RecentEntry): { text: string; color: string } {
    switch (entry.type) {
        case 'sale':
            return {
                text: formatSignedAr(entry.amount ?? 0, 'Ar'),
                color: VALUE_COLOR.pos,
            };
        case 'expense':
        case 'investment':
            return {
                text: formatSignedAr(-(entry.amount ?? 0), 'Ar'),
                color: VALUE_COLOR.neg,
            };
        case 'owner_in':
            return {
                text: formatSignedAr(entry.amount ?? 0, 'Ar'),
                color: VALUE_COLOR.primary,
            };
        case 'owner_out':
            return {
                text: formatSignedAr(-(entry.amount ?? 0), 'Ar'),
                color: VALUE_COLOR.primary,
            };
        case 'headcount':
            return {
                text: formatSignedAr(entry.headcount_delta ?? 0),
                color: VALUE_COLOR.slate,
            };
        case 'production':
            return {
                text: formatSignedAr(entry.quantity ?? 0),
                color: VALUE_COLOR.slate,
            };
        default:
            return { text: '', color: VALUE_COLOR.slate };
    }
}

export default function Dashboard({
    eyebrow,
    period,
    balance,
    projects,
    recentEntries,
}: {
    eyebrow: string;
    period: Period;
    balance: Balance;
    projects: ProjectCard[];
    recentEntries: RecentEntry[];
}) {
    function changePeriod(next: Period) {
        router.get(
            dashboard().url,
            { period: next === 'all' ? undefined : next },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Vue d'ensemble" />

            <div className="dot-grid flex flex-1 flex-col gap-[22px] px-9 pt-7 pb-12">
                <PageHeader
                    eyebrow={eyebrow}
                    title="Vos projets en un coup d'œil"
                    actions={
                        <SegmentedControl
                            aria-label="Période"
                            options={PERIOD_OPTIONS}
                            value={period}
                            onChange={changePeriod}
                        />
                    }
                />

                <section
                    aria-label="Bilan global"
                    className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[18px] rounded-2xl bg-primary px-6 py-[22px] text-white"
                >
                    <BalanceFigure
                        label="Capital engagé"
                        value={formatAr(balance.capital_engaged)}
                        sub={`dans ${balance.projects_count} projet${balance.projects_count > 1 ? 's' : ''}`}
                    />
                    <BalanceFigure
                        label="Résultat cumulé"
                        value={formatSignedAr(balance.result, 'Ar')}
                        sub="recettes − dépenses courantes"
                    />
                    <BalanceFigure
                        label="Capital récupéré"
                        value={`${balance.capital_recovered_percent} %`}
                        sub={
                            balance.capital_remaining > 0
                                ? `${formatAr(balance.capital_remaining)} restent à récupérer`
                                : 'Capital entièrement récupéré'
                        }
                    />
                    <BalanceFigure
                        label="Temps investi"
                        value={`${balance.hours_invested} h`}
                        sub="depuis le début"
                    />
                    <BalanceFigure
                        label="Rendement moyen"
                        value={balance.per_hour_formatted}
                        sub="résultat ÷ temps passé"
                    />
                </section>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-12 text-center">
                        <p className="font-medium">
                            Aucun projet pour l'instant
                        </p>
                        <p className="text-sm text-muted">
                            Créez votre premier projet pour voir apparaître ses
                            chiffres ici.
                        </p>
                    </div>
                ) : (
                    <section
                        aria-label="Projets"
                        className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4"
                    >
                        {projects.map((project) => (
                            <ProjectSummaryCard
                                key={project.id}
                                project={project}
                            />
                        ))}
                    </section>
                )}

                <section
                    aria-labelledby="flux-title"
                    className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow)]"
                >
                    <div className="flex items-baseline justify-between pb-2">
                        <h2
                            id="flux-title"
                            className="m-0 text-base font-bold tracking-[-0.02em]"
                        >
                            Derniers flux
                        </h2>
                        <Link
                            href={history()}
                            className="text-[13.5px] font-medium no-underline"
                        >
                            Tout l'historique →
                        </Link>
                    </div>
                    {recentEntries.length === 0 ? (
                        <p className="py-3 text-sm text-muted">
                            Aucun flux pour l'instant.
                        </p>
                    ) : (
                        recentEntries.map((entry) => {
                            const badge = ENTRY_BADGE[entry.type];
                            const value = entryValueLabel(entry);

                            return (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-3 border-t border-border py-2.5"
                                >
                                    <span className="num w-10 shrink-0 text-xs text-muted">
                                        {entry.time_label}
                                    </span>
                                    {badge && (
                                        <VerdictBadge
                                            tone={badge.tone}
                                            className="w-[70px] shrink-0 justify-center rounded-md px-0 py-0.5 text-[11.5px]"
                                        >
                                            {badge.label}
                                        </VerdictBadge>
                                    )}
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="truncate text-sm font-semibold">
                                            {entry.label}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-muted">
                                            <span
                                                className="size-[7px] shrink-0 rounded-[2px]"
                                                style={{
                                                    backgroundColor:
                                                        entry.project_color,
                                                }}
                                            />
                                            {entry.project_name}
                                        </span>
                                    </div>
                                    <span
                                        className="num shrink-0 text-sm font-medium whitespace-nowrap"
                                        style={{ color: value.color }}
                                    >
                                        {value.text}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </section>
            </div>
        </>
    );
}

function BalanceFigure({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[13px] text-[#EFF6FF]">{label}</span>
            <span className="num text-[22px] font-medium tracking-[-0.02em]">
                {value}
            </span>
            <span className="text-xs text-[#EFF6FF]">{sub}</span>
        </div>
    );
}

function ProjectSummaryCard({ project }: { project: ProjectCard }) {
    return (
        <Link
            href={project.href}
            className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-[18px] text-text no-underline shadow-[var(--shadow)]"
        >
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2.5 text-base font-bold tracking-[-0.01em]">
                        <span
                            className="size-2.5 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                    </span>
                    <span className="text-[12.5px] text-muted">
                        {project.model_label} · {project.since_label}
                    </span>
                </div>
                <VerdictBadge tone={project.verdict_tone} className="shrink-0">
                    {project.verdict_label}
                </VerdictBadge>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-muted">
                        Capital récupéré
                    </span>
                    <span className="num text-xl font-medium">
                        {project.capital_recovered_percent} %
                    </span>
                </div>
                <ProgressBar
                    value={project.capital_recovered_percent}
                    color={VALUE_COLOR[project.verdict_tone]}
                />
            </div>

            <Sparkline
                points={project.trajectory}
                color={project.color}
                ariaLabel={`Trajectoire cumulée de ${project.name}`}
                showLabels
                className="overflow-hidden rounded-[10px] border border-border bg-bg"
            />

            <div
                className={`grid gap-2.5 ${project.secondary_stat ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11.5px] text-muted">Résultat</span>
                    <span
                        className="num text-[13.5px] font-medium"
                        style={{
                            color:
                                project.result >= 0
                                    ? VALUE_COLOR.pos
                                    : VALUE_COLOR.neg,
                        }}
                    >
                        {formatSignedAr(project.result)}
                    </span>
                </div>
                {project.secondary_stat && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11.5px] text-muted">
                            {project.secondary_stat.label}
                        </span>
                        <span className="num text-[13.5px] font-medium">
                            {project.secondary_stat.value}
                        </span>
                    </div>
                )}
            </div>

            {project.last_milestone && (
                <div className="flex items-start gap-2 border-t border-border pt-3 text-[13px] leading-relaxed text-text2">
                    <Flag
                        aria-hidden="true"
                        className="mt-0.5 size-[15px] shrink-0 text-primary-text"
                    />
                    <span>
                        {project.last_milestone.date_label} ·{' '}
                        {project.last_milestone.text}
                    </span>
                </div>
            )}
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Vue d'ensemble",
            href: dashboard(),
        },
    ],
};
