import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as projectsIndex, show } from '@/routes/projects';

type Verdict = 'starting' | 'profitable' | 'watch' | 'loss';

type ProjectSummary = {
    id: string;
    name: string;
    color: string | null;
    income_formatted: string;
    expense_formatted: string;
    balance_formatted: string;
    balance_is_positive: boolean;
    verdict: Verdict;
    cumulative_result_formatted: string;
    capital_recovered_percent: number;
};

type RecentEntry = {
    id: string;
    project_name: string;
    category_name: string | null;
    type: string;
    amount_formatted: string | null;
    occurred_at: string;
};

type Pocket = {
    out_formatted: string;
    in_formatted: string;
    still_committed_formatted: string;
    available_formatted: string;
};

const VERDICT_LABELS: Record<Verdict, string> = {
    starting: 'En démarrage',
    profitable: 'Profitable',
    watch: 'À surveiller',
    loss: 'En perte',
};

const VERDICT_VARIANTS: Record<Verdict, 'secondary' | 'outline'> = {
    starting: 'outline',
    profitable: 'secondary',
    watch: 'outline',
    loss: 'outline',
};

function formatPeriod(isoDate: string): string {
    const label = new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(isoDate));

    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
        new Date(isoDate),
    );
}

export default function Dashboard({
    period_start,
    projects,
    recentEntries,
    pocket,
}: {
    period_start: string;
    projects: ProjectSummary[];
    recentEntries: RecentEntry[];
    pocket: Pocket;
}) {
    return (
        <>
            <Head title="Vue d'ensemble" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Vue d'ensemble"
                        description={`Aperçu de ${formatPeriod(period_start)}`}
                    />
                    <Button asChild variant="outline">
                        <Link href={projectsIndex()}>Projets</Link>
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                        <p className="font-medium">
                            Aucun projet pour l'instant
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Créez votre premier projet pour voir apparaître ses
                            chiffres ici.
                        </p>
                        <Button asChild className="mt-2">
                            <Link href={projectsIndex()}>Créer un projet</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id}>
                                <CardHeader className="flex flex-row items-start justify-between gap-2">
                                    <CardTitle>
                                        <Link
                                            href={show(project.id)}
                                            className="inline-flex items-center gap-2 hover:underline"
                                        >
                                            <span
                                                className="size-2.5 shrink-0 rounded-full border border-black/10 dark:border-white/10"
                                                style={{
                                                    backgroundColor:
                                                        project.color ??
                                                        '#94a3b8',
                                                }}
                                                aria-hidden
                                            />
                                            {project.name}
                                        </Link>
                                    </CardTitle>
                                    <Badge
                                        variant={
                                            VERDICT_VARIANTS[project.verdict]
                                        }
                                    >
                                        {VERDICT_LABELS[project.verdict]}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Ventes
                                        </span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            {project.income_formatted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Dépenses
                                        </span>
                                        <span className="font-medium text-red-600 dark:text-red-400">
                                            {project.expense_formatted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-1.5 text-sm">
                                        <span className="text-muted-foreground">
                                            Solde du mois
                                        </span>
                                        <span
                                            className={
                                                project.balance_is_positive
                                                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                                                    : 'font-semibold text-red-600 dark:text-red-400'
                                            }
                                        >
                                            {project.balance_formatted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Résultat cumulé
                                        </span>
                                        <span className="font-medium">
                                            {
                                                project.cumulative_result_formatted
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Capital récupéré
                                        </span>
                                        <span className="font-medium">
                                            {project.capital_recovered_percent}%
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {projects.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ma poche</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-4">
                            <PocketStat
                                label="Sorti de ma poche"
                                value={pocket.out_formatted}
                            />
                            <PocketStat
                                label="Revenu dans ma poche"
                                value={pocket.in_formatted}
                            />
                            <PocketStat
                                label="Encore engagé"
                                value={pocket.still_committed_formatted}
                            />
                            <PocketStat
                                label="Disponible dans les projets"
                                value={pocket.available_formatted}
                            />
                        </CardContent>
                    </Card>
                )}

                {projects.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Derniers flux</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {recentEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucun flux pour l'instant.
                                </p>
                            ) : (
                                recentEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                                    >
                                        <div className="flex flex-1 flex-wrap items-center gap-3">
                                            <span className="w-24 shrink-0 text-sm text-muted-foreground">
                                                {formatDate(entry.occurred_at)}
                                            </span>
                                            <Badge variant="secondary">
                                                {entry.project_name}
                                            </Badge>
                                            {entry.category_name && (
                                                <Badge variant="outline">
                                                    {entry.category_name}
                                                </Badge>
                                            )}
                                        </div>
                                        {entry.amount_formatted && (
                                            <span
                                                className={
                                                    entry.type === 'sale'
                                                        ? 'text-sm font-medium text-emerald-600 dark:text-emerald-400'
                                                        : 'text-sm font-medium text-red-600 dark:text-red-400'
                                                }
                                            >
                                                {entry.type === 'sale'
                                                    ? '+'
                                                    : '-'}
                                                {entry.amount_formatted}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function PocketStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
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
