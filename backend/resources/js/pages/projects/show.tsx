import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, Lock, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import BatchController from '@/actions/App/Http/Web/Controllers/BatchController';
import CategoryController from '@/actions/App/Http/Web/Controllers/CategoryController';
import { BatchFormDialog } from '@/components/batch-form-dialog';
import {
    CategoryFormDialog,
    type Category,
} from '@/components/category-form-dialog';
import { EntryFormDialog, type Entry } from '@/components/entry-form-dialog';
import { EntryRow } from '@/components/entry-row';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectAvatar } from '@/components/ui/project-avatar';
import { index as projectsIndex, show } from '@/routes/projects';
import { PageHeader } from '@/components/page-header';
import { ProjectHeader } from '@/components/project-header';
import { StatTile } from '@/components/ui/stat-tile';
import Section from '@/components/section';
import { InfoNote } from '@/components/ui/info-note';
import { GoalCard } from '@/components/ui/goal-card';
import { IconButton } from '@/components/ui/icon-button';
import { TrajectoryChart, TrajectoryXAxis } from '@/components/charts/trajectory-chart';
import { trajectoryDomain, trajectoryMilestones, trajectoryProjection, trajectoryReal, trajectorySaleTags, trajectoryXTicks, trajectoryYTicks } from '../dev/ui-demo-data';

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};

type Project = {
    id: string;
    name: string;
    model: 'lots' | 'herd' | 'resale' | 'simple';
    color: string | null;
    status: 'active' | 'archived';
    currency: string;
};

type Batch = {
    id: string;
    number: number;
    name: string | null;
    started_on: string;
    planned_end_on: string | null;
    closed_on: string | null;
    initial_headcount: number;
    alive: number;
    deaths: number;
    sold: number;
    loss_rate: number;
    cost_formatted: string;
    sales_formatted: string;
    margin_formatted: string;
    cost_per_sold_formatted: string | null;
};

function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
        new Date(isoDate),
    );
}

export default function ProjectShow({
    project,
    categories,
    entries,
    batches,
}: {
    project: Project;
    categories: Category[];
    entries: Paginated<Entry>;
    batches: Batch[];
}) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Projets', href: projectsIndex() },
            { title: project.name, href: show(project.id) },
        ],
    });

    const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
    const [createEntryOpen, setCreateEntryOpen] = useState(false);
    const [openBatchOpen, setOpenBatchOpen] = useState(false);
    const [milestoneSel, setMilestoneSel] = useState(3);

    const incomeCategories = categories.filter((c) => c.kind === 'income');
    const expenseCategories = categories.filter((c) => c.kind === 'expense');
    const investmentCategories = categories.filter(
        (c) => c.kind === 'investment',
    );

    const openBatches = batches.filter((b) => b.closed_on === null);

    return (
        <>
            <Head title={project.name} />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    eyebrow="samedi 10 octobre · 3 projets actifs"
                    title="Vos projets en un coup d'œil"
                    actions={
                        <Button variant="outline">
                            Exporter CSV
                        </Button>
                    }
                />
                <ProjectHeader
                    backHref="#"
                    backLabel="// mes projets"
                    name="Poulets de chair"
                    color="var(--b1)"
                    verdictLabel="Rentable"
                    verdictTone="pos"
                    modelLabel="Élevage par lots"
                    meta="depuis le 2 mars 2026 · 4 bandes"
                    actions={
                        <Button>
                            Planifier la bande 5
                        </Button>
                    }
                    tabs={[
                        {
                            label: "Vue d'ensemble",
                            href: '#',
                            current: true,
                        },
                        {
                            label: 'Lots',
                            href: '#',
                            current: false,
                        },
                        {
                            label: 'Historique',
                            href: '#',
                            current: false,
                        },
                    ]}
                />

                <Section>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <StatTile
                            label="Résultat"
                            value="+ 476 000"
                            sub="3 bandes vendues"
                            valueColor="var(--pos)"
                        />
                        <StatTile
                            label="Capital récupéré"
                            value="73 %"
                            variant="featured"
                        />
                        <StatTile
                            label="Œufs pas encore vendus"
                            value="59"
                            sub="29 500 Ar qui attendent"
                            variant="alert"
                        />
                        <StatTile
                            label="Temps passé"
                            value="124 h"
                            sub="3 840 Ar / heure"
                        />
                    </div>
                    <InfoNote>
                        Rien n'est jamais effacé. Corriger un flux ajoute
                        une nouvelle ligne et l'original reste visible.
                    </InfoNote>
                </Section>
                <Section>
                    <Card>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex justify-between">
                                <h2 className="font-bold">Objectifs</h2>
                                <Link
                                    href="#"
                                    className="inline-flex items-center justify-center gap-1 font-semibold text-sm text-primary-text no-underline hover:underline"
                                    //className="text-primary-text no-underline hover:underline"
                                >
                                    <Plus  aria-hidden="true" className="inline-block mr-1 size-4" strokeWidth={2.4} /> 
                                    Objectif
                                </Link>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <GoalCard
                                    title="Récupérer tout le capital (650 000 Ar)"
                                    badgeLabel="En avance"
                                    badgeTone="pos"
                                    progress={73}
                                    left="73 % · avant le 31 déc. (J−82)"
                                    right="prévu le 3 nov."
                                />
                                <GoalCard
                                    title="Écouler les 8 écouteurs"
                                    badgeLabel="En retard"
                                    badgeTone="neg"
                                    progress={2}
                                    progressColor="var(--neg)"
                                    left="0 / 8 · avant le 31 oct. (J−21)"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Trajectoire (avec jalons)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <TrajectoryChart
                                ariaLabel="Trajectoire : de −900 000 Ar en mars à −174 000 Ar aujourd'hui, projection à +774 000 Ar"
                                domain={trajectoryDomain}
                                realPoints={trajectoryReal}
                                projectionPoints={trajectoryProjection}
                                yTicks={trajectoryYTicks}
                                saleTags={trajectorySaleTags}
                                markers={trajectoryMilestones.map(
                                    (m) => ({
                                        ...m,
                                        color: 'var(--b1)',
                                        selected:
                                            milestoneSel ===
                                            Number(m.id),
                                        ariaLabel: `Jalon ${m.id} : ${m.title}`,
                                        onSelect: () =>
                                            setMilestoneSel(
                                                Number(m.id),
                                            ),
                                    }),
                                )}
                            />
                            <TrajectoryXAxis
                                domain={trajectoryDomain}
                                xTicks={trajectoryXTicks}
                            />
                        </CardContent>
                    </Card>
                </Section>

            </div>

            <CategoryFormDialog
                open={createCategoryOpen}
                onOpenChange={setCreateCategoryOpen}
                project={project}
            />
            <EntryFormDialog
                open={createEntryOpen}
                onOpenChange={setCreateEntryOpen}
                project={project}
                categories={categories}
                batches={openBatches.map((b) => ({
                    id: b.id,
                    label: `Bande ${b.number}${b.name ? ` — ${b.name}` : ''}`,
                    alive: b.alive,
                }))}
            />
            <BatchFormDialog
                open={openBatchOpen}
                onOpenChange={setOpenBatchOpen}
                project={project}
            />
        </>
    );
}

function CategoryColumn({
    title,
    categories,
    project,
}: {
    title: string;
    categories: Category[];
    project: { id: string };
}) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
                {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Aucune catégorie.
                    </p>
                )}
                {categories.map((category) => (
                    <CategoryRow
                        key={category.id}
                        project={project}
                        category={category}
                    />
                ))}
            </div>
        </div>
    );
}

function CategoryRow({
    project,
    category,
}: {
    project: { id: string };
    category: Category;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);

    return (
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <span className="text-sm">{category.name}</span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                        Archiver
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CategoryFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                project={project}
                category={category}
            />
            <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <DialogContent>
                    <DialogTitle>Archiver « {category.name} » ?</DialogTitle>
                    <DialogDescription>
                        Les flux existants de cette catégorie restent dans
                        l'historique. Elle n'apparaîtra plus pour en noter de
                        nouveaux.
                    </DialogDescription>
                    <Form
                        {...CategoryController.archive.form(category.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Archiver
                                </Button>
                            </DialogFooter>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function BatchRow({ batch }: { batch: Batch }) {
    const [closeOpen, setCloseOpen] = useState(false);
    const isClosed = batch.closed_on !== null;

    return (
        <div className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        Bande {batch.number}
                        {batch.name ? ` — ${batch.name}` : ''}
                    </span>
                    <Badge variant={isClosed ? 'outline' : 'secondary'}>
                        {isClosed
                            ? `Clôturée le ${formatDate(batch.closed_on!)}`
                            : `Ouverte le ${formatDate(batch.started_on)}`}
                    </Badge>
                </div>
                {!isClosed && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCloseOpen(true)}
                    >
                        <Lock />
                        Clôturer
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-7">
                <Stat label="Départ" value={String(batch.initial_headcount)} />
                <Stat label="En vie" value={String(batch.alive)} />
                <Stat
                    label="Morts"
                    value={`${batch.deaths} (${batch.loss_rate}%)`}
                />
                <Stat label="Vendus" value={String(batch.sold)} />
                <Stat label="Coût" value={batch.cost_formatted} />
                <Stat label="Ventes" value={batch.sales_formatted} />
                <Stat label="Marge" value={batch.margin_formatted} />
            </div>

            <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
                <DialogContent>
                    <DialogTitle>
                        Clôturer la bande {batch.number} ?
                    </DialogTitle>
                    <DialogDescription>
                        Son historique reste visible. Vous pourrez toujours
                        corriger un flux par flux inverse ensuite.
                    </DialogDescription>
                    <Form
                        {...BatchController.close.form(batch.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Clôturer
                                </Button>
                            </DialogFooter>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
