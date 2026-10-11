import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { EntryRow } from '@/components/entry-row';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Entry, EntryType } from '@/components/entry-form-dialog';
import { history as historyRoute } from '@/routes';

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};

type Project = { id: string; name: string };

type Filters = {
    project_id: string | null;
    type: EntryType | null;
    from: string | null;
    to: string | null;
};

const TYPE_LABELS: Record<EntryType, string> = {
    sale: 'Vente',
    expense: 'Dépense',
    investment: 'Investissement',
    owner_in: 'Apport',
    owner_out: 'Retrait',
    headcount: "Mouvement d'effectif",
    production: 'Production',
    note: 'Note',
};

const ALL = '__all__';

function formatDayHeading(isoDate: string): string {
    const label = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(isoDate));

    return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupByDay(
    entries: (Entry & { project_name: string })[],
): [string, (Entry & { project_name: string })[]][] {
    const groups = new Map<string, (Entry & { project_name: string })[]>();

    for (const entry of entries) {
        const day = entry.occurred_at;
        groups.set(day, [...(groups.get(day) ?? []), entry]);
    }

    return Array.from(groups.entries());
}

export default function HistoryIndex({
    entries,
    projects,
    filters,
}: {
    entries: Paginated<Entry & { project_name: string }>;
    projects: Project[];
    filters: Filters;
}) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function applyFilters(next: Partial<Filters>) {
        const merged = { ...filters, ...next };

        router.get(
            historyRoute(),
            {
                project_id: merged.project_id ?? undefined,
                type: merged.type ?? undefined,
                from: merged.from ?? undefined,
                to: merged.to ?? undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    const days = groupByDay(entries.data);
    const hasFilters = !!(
        filters.project_id ||
        filters.type ||
        filters.from ||
        filters.to
    );

    return (
        <>
            <Head title="Historique" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Historique"
                    description="Tous les flux de votre organisation, groupés par jour."
                />

                <Card>
                    <CardContent className="flex flex-wrap items-end gap-4 pt-6">
                        <div className="grid gap-2">
                            <Label htmlFor="filter-project">Projet</Label>
                            <Select
                                value={filters.project_id ?? ALL}
                                onValueChange={(value) =>
                                    applyFilters({
                                        project_id:
                                            value === ALL ? null : value,
                                    })
                                }
                            >
                                <SelectTrigger
                                    id="filter-project"
                                    className="w-48"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>
                                        Tous les projets
                                    </SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="filter-type">Type</Label>
                            <Select
                                value={filters.type ?? ALL}
                                onValueChange={(value) =>
                                    applyFilters({
                                        type:
                                            value === ALL
                                                ? null
                                                : (value as EntryType),
                                    })
                                }
                            >
                                <SelectTrigger
                                    id="filter-type"
                                    className="w-48"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>
                                        Tous les types
                                    </SelectItem>
                                    {Object.entries(TYPE_LABELS).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="filter-from">Du</Label>
                            <Input
                                id="filter-from"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                onBlur={() =>
                                    applyFilters({ from: from || null })
                                }
                                className="w-40"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="filter-to">Au</Label>
                            <Input
                                id="filter-to"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                onBlur={() => applyFilters({ to: to || null })}
                                className="w-40"
                            />
                        </div>

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setFrom('');
                                    setTo('');
                                    router.get(historyRoute());
                                }}
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {entries.total} flux{hasFilters ? ' (filtrés)' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {days.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aucun flux ne correspond à ces filtres.
                            </p>
                        )}

                        {days.map(([day, dayEntries]) => (
                            <div key={day} className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    {formatDayHeading(day)}
                                </p>
                                {dayEntries.map((entry) => (
                                    <EntryRow
                                        key={entry.id}
                                        entry={entry}
                                        showProjectBadge
                                    />
                                ))}
                            </div>
                        ))}

                        {entries.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {entries.current_page} /{' '}
                                    {entries.last_page}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!entries.prev_page_url}
                                        onClick={() =>
                                            entries.prev_page_url &&
                                            router.get(
                                                entries.prev_page_url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!entries.next_page_url}
                                        onClick={() =>
                                            entries.next_page_url &&
                                            router.get(
                                                entries.next_page_url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HistoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Historique',
            href: historyRoute(),
        },
    ],
};
