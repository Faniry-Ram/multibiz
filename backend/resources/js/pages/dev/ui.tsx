import { Head } from '@inertiajs/react';
import {
    LayoutGrid,
    BarChart3,
    Wallet,
    History,
    CheckSquare,
    Settings,
    Egg,
    Beef,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';

import { DivergingBars } from '@/components/charts/diverging-bars';
import { HBarList } from '@/components/charts/hbar-list';
import { MonthlyBars } from '@/components/charts/monthly-bars';
import {
    MultiLineChart,
    type LinePoint,
} from '@/components/charts/multi-line-chart';
import { PairedBars } from '@/components/charts/paired-bars';
import { Sparkline } from '@/components/charts/sparkline';
import { StackedBar } from '@/components/charts/stacked-bar';
import { StepAreaChart } from '@/components/charts/step-area-chart';
import { StepLineChart } from '@/components/charts/step-line-chart';
import {
    TrajectoryChart,
    TrajectoryXAxis,
} from '@/components/charts/trajectory-chart';
import { WeekStrip } from '@/components/charts/week-strip';
import { PageHeader } from '@/components/page-header';
import { ProjectHeader } from '@/components/project-header';
import { TopBar } from '@/components/top-bar';
import { NavSidebar, type NavItem } from '@/components/nav-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChoiceCard } from '@/components/ui/choice-card';
import { DataGridHeader, DataGridRow } from '@/components/ui/data-grid';
import { DateInput } from '@/components/ui/date-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterChip } from '@/components/ui/filter-chip';
import { GoalCard } from '@/components/ui/goal-card';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { InfoNote } from '@/components/ui/info-note';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import { ProjectAvatar, ProjectDot } from '@/components/ui/project-avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SourceBadge } from '@/components/ui/source-badge';
import { StatTile } from '@/components/ui/stat-tile';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Timeline } from '@/components/ui/timeline';
import { VerdictBadge, type VerdictTone } from '@/components/ui/verdict-badge';
import {
    costSegments,
    demoProjects,
    divergingRows,
    eggCostWeeks,
    headcountEvents,
    headcountStart,
    monthlyBarsMonths,
    multiLineMonths,
    multiLineSeries,
    pairedBarsDays,
    pocketEvents,
    pocketTags,
    sparklinePoints,
    timelineSteps,
    trajectoryDomain,
    trajectoryMilestones,
    trajectoryProjection,
    trajectoryReal,
    trajectorySaleTags,
    trajectoryXTicks,
    trajectoryYTicks,
    weekStripDays,
    weightDays,
    weightSeries,
} from '@/pages/dev/ui-demo-data';

const TOKEN_SWATCHES: { name: string; className: string }[] = [
    { name: 'bg', className: 'bg-bg' },
    { name: 'surface', className: 'bg-surface border border-border' },
    { name: 'surface2', className: 'bg-surface2' },
    { name: 'border', className: 'bg-border' },
    { name: 'text', className: 'bg-text' },
    { name: 'text2', className: 'bg-text2' },
    { name: 'muted', className: 'bg-muted' },
    { name: 'primary', className: 'bg-primary' },
    { name: 'primary-soft', className: 'bg-primary-soft' },
    { name: 'pos', className: 'bg-pos' },
    { name: 'pos-soft', className: 'bg-pos-soft' },
    { name: 'neg', className: 'bg-neg' },
    { name: 'neg-soft', className: 'bg-neg-soft' },
    { name: 'warn', className: 'bg-warn' },
    { name: 'warn-soft', className: 'bg-warn-soft' },
    { name: 'slate-soft', className: 'bg-slate-soft' },
    { name: 'b1', className: 'bg-b1' },
    { name: 'b2', className: 'bg-b2' },
    { name: 'b3', className: 'bg-b3' },
    { name: 'b4', className: 'bg-b4' },
    { name: 'b5', className: 'bg-b5' },
    { name: 'b6', className: 'bg-b6' },
];

const VERDICT_SAMPLES: { tone: VerdictTone; label: string }[] = [
    { tone: 'pos', label: 'Rentable' },
    { tone: 'warn', label: 'À surveiller' },
    { tone: 'primary', label: 'En démarrage' },
    { tone: 'neg', label: 'En perte' },
    { tone: 'slate', label: 'Correct' },
];

const NAV_ITEMS: NavItem[] = [
    { label: "Vue d'ensemble", href: '#', icon: LayoutGrid, current: true },
    { label: 'Analyse', href: '#', icon: BarChart3, current: false },
    { label: 'Ma poche', href: '#', icon: Wallet, current: false },
    { label: 'Historique', href: '#', icon: History, current: false },
    { label: 'Tâches', href: '#', icon: CheckSquare, current: false },
    { label: 'Paramètres', href: '#', icon: Settings, current: false },
];

const MODEL_CHOICES = [
    {
        icon: Beef,
        title: 'Élevage par lots',
        description: 'Chaque bande a un début, une fin et un coût par tête.',
        meta: 'poulets de chair, cailles',
    },
    {
        icon: Egg,
        title: 'Élevage par effectif',
        description: 'Un troupeau qui vit en continu.',
        meta: 'pondeuses, lapins',
    },
    {
        icon: ShoppingBag,
        title: 'Revente avec stock',
        description: 'Acheter, stocker, revendre.',
        meta: 'téléphones, vêtements',
    },
];

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
                <h2 className="m-0 text-[17px] font-bold tracking-[-0.02em]">
                    {title}
                </h2>
                {description && (
                    <p className="m-0 text-[13.5px] text-muted">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

export default function DevUiShowcase() {
    const [switchOn, setSwitchOn] = useState(true);
    const [period, setPeriod] = useState('since');
    const [stepperValue, setStepperValue] = useState(5);
    const [modelChoice, setModelChoice] = useState(0);
    const [hoverIndex, setHoverIndex] = useState<number | undefined>(7);
    const [selectedDay, setSelectedDay] = useState(9);
    const [milestoneSel, setMilestoneSel] = useState(3);

    const lineSeries = multiLineSeries.map((s) => ({
        name: s.name,
        color: s.color,
        dots: false,
        endLabel: `${s.name.split(' ')[0]} ${
            (s.points[s.points.length - 1] ?? 0) >= 0 ? '+' : '−'
        }${Math.abs(s.points[s.points.length - 1] ?? 0)} k`,
        points: s.points.map((v, i): LinePoint =>
            v === null ? null : { x: i, y: v },
        ),
    }));

    const weightLines = weightSeries.map((s) => ({
        name: s.name,
        color: s.color,
        strokeWidth: s.emphasized ? 2.6 : 1.5,
        dots: s.emphasized,
        points: s.values.map((v, i): LinePoint => ({ x: weightDays[i], y: v })),
    }));

    return (
        <>
            <Head title="Showcase de composants" />

            <div className="min-h-screen bg-bg text-text">
                <header className="flex items-center justify-between border-b border-border bg-surface px-9 py-5">
                    <div className="flex flex-col gap-1">
                        <span className="num text-[12.5px] text-primary-text">
                            // outil local · /_dev/ui
                        </span>
                        <h1 className="m-0 text-[32px] font-bold tracking-[-0.03em]">
                            Composants MultiBiz
                        </h1>
                    </div>
                </header>

                <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-9 py-9">
                    <Section
                        title="Couleurs"
                        description="docs/maquette/tokens.css — identiques en clair et en sombre, sauf mention."
                    >
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                            {TOKEN_SWATCHES.map((swatch) => (
                                <div
                                    key={swatch.name}
                                    className="flex flex-col gap-1.5"
                                >
                                    <div
                                        className={`h-12 rounded-lg ${swatch.className}`}
                                    />
                                    <span className="num text-xs text-muted">
                                        {swatch.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Typographie">
                        <Card>
                            <CardContent className="flex flex-col gap-3">
                                <span className="num text-[12.5px] text-primary-text">
                                    // eyebrow Geist Mono
                                </span>
                                <h1 className="m-0 text-[32px] font-bold tracking-[-0.03em]">
                                    Titre de page (h1, 32px)
                                </h1>
                                <h2 className="m-0 text-[17px] font-bold tracking-[-0.02em]">
                                    Titre de carte (h2, 16–17px)
                                </h2>
                                <p className="m-0 text-sm text-text2">
                                    Texte courant 14–14.5px, sur Geist.
                                </p>
                                <p className="num m-0 text-sm text-muted">
                                    1 250 000 Ar · + 476 000 · 73 % · sam. 10
                                    oct. (Geist Mono, tabular-nums)
                                </p>
                            </CardContent>
                        </Card>
                    </Section>

                    <Section title="Boutons">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button>Principal</Button>
                            <Button variant="outline">Secondaire</Button>
                            <Button variant="destructive">Danger</Button>
                            <Button variant="ghost">Discret</Button>
                            <Button disabled>Désactivé</Button>
                            <IconButton aria-label="Fermer">
                                <Settings />
                            </IconButton>
                            <IconButton aria-label="Primaire" variant="primary">
                                <Settings />
                            </IconButton>
                        </div>
                    </Section>

                    <Section title="Badges">
                        <div className="flex flex-wrap items-center gap-3">
                            {VERDICT_SAMPLES.map((v) => (
                                <VerdictBadge key={v.tone} tone={v.tone}>
                                    {v.label}
                                </VerdictBadge>
                            ))}
                            <SourceBadge source="auto" />
                            <SourceBadge source="recurring" />
                            <SourceBadge source="manual" />
                            <SourceBadge source="low-stock" />
                            <Badge variant="outline">Correction</Badge>
                        </div>
                    </Section>

                    <Section title="Tuiles de chiffre & carte d'objectif">
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
                        <InfoNote>
                            Rien n'est jamais effacé. Corriger un flux ajoute
                            une nouvelle ligne et l'original reste visible.
                        </InfoNote>
                    </Section>

                    <Section title="Avatars et puces de projet">
                        <div className="flex flex-wrap items-center gap-4">
                            <ProjectAvatar
                                initials="pc"
                                color="var(--b1)"
                                size="lg"
                            />
                            <ProjectAvatar
                                initials="œu"
                                color="var(--b2)"
                                size="sm"
                            />
                            <ProjectAvatar
                                initials="re"
                                color="var(--b3)"
                                size="sm"
                            />
                            <span className="flex items-center gap-2 text-sm">
                                <ProjectDot color="var(--b4)" /> Violet
                            </span>
                            <span className="flex items-center gap-2 text-sm">
                                <ProjectDot color="var(--b5)" /> Olive
                            </span>
                        </div>
                    </Section>

                    <Section title="Champs de formulaire">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="demo-input">
                                    Nom du projet
                                </Label>
                                <Input
                                    id="demo-input"
                                    placeholder="ex. Cailles"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="demo-select">Modèle</Label>
                                <Select defaultValue="lots">
                                    <SelectTrigger
                                        id="demo-select"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lots">
                                            Lots
                                        </SelectItem>
                                        <SelectItem value="herd">
                                            Effectif
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="demo-date">Date de début</Label>
                                <DateInput
                                    id="demo-date"
                                    defaultValue="2026-10-10"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <Label htmlFor="demo-textarea">Note</Label>
                                <Textarea
                                    id="demo-textarea"
                                    rows={2}
                                    placeholder="Observation libre…"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Nombre d'animaux</Label>
                                <NumberStepper
                                    value={stepperValue}
                                    onChange={setStepperValue}
                                    min={0}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2.5 text-sm">
                                <Switch
                                    checked={switchOn}
                                    onCheckedChange={setSwitchOn}
                                />
                                Module activé
                            </label>
                            <SegmentedControl
                                aria-label="Période"
                                value={period}
                                onChange={setPeriod}
                                options={[
                                    {
                                        value: 'since',
                                        label: 'Depuis le début',
                                    },
                                    { value: '6m', label: '6 mois' },
                                    { value: '30d', label: '30 jours' },
                                ]}
                            />
                            <div className="flex gap-1.5">
                                <FilterChip
                                    pressed
                                    color="var(--b1)"
                                    onPressedChange={() => {}}
                                >
                                    Poulets de chair
                                </FilterChip>
                                <FilterChip
                                    pressed={false}
                                    onPressedChange={() => {}}
                                >
                                    Ventes
                                </FilterChip>
                            </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            {MODEL_CHOICES.map((choice, i) => (
                                <ChoiceCard
                                    key={choice.title}
                                    icon={choice.icon}
                                    title={choice.title}
                                    description={choice.description}
                                    meta={choice.meta}
                                    bullets={[
                                        'Coût et marge',
                                        'Pertes et pesées',
                                    ]}
                                    selected={modelChoice === i}
                                    onSelect={() => setModelChoice(i)}
                                />
                            ))}
                        </div>
                    </Section>

                    <Section title="Fenêtre de dialogue">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Ouvrir un exemple</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <div className="flex flex-col gap-0.5">
                                        <DialogTitle>Noter un flux</DialogTitle>
                                        <DialogDescription>
                                            Tout ce qui entre, sort ou change
                                            dans un projet.
                                        </DialogDescription>
                                    </div>
                                </DialogHeader>
                                <div className="flex flex-col gap-4 px-5 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="dialog-amount">
                                            Montant (Ar)
                                        </Label>
                                        <Input
                                            id="dialog-amount"
                                            type="number"
                                            defaultValue={120000}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <span className="flex justify-between text-[13px]">
                                        <span className="text-muted">
                                            Poulets de chair · bande 4
                                        </span>
                                        <span className="num font-semibold text-neg">
                                            − 120 000 Ar
                                        </span>
                                    </span>
                                    <Button>Enregistrer</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </Section>

                    <Section title="Grille de données">
                        <Card>
                            <CardContent className="flex flex-col">
                                <DataGridHeader columns="1.3fr 1fr 1fr 0.8fr">
                                    <span>lot</span>
                                    <span className="text-right">départ</span>
                                    <span className="text-right">pertes</span>
                                    <span className="text-right">marge</span>
                                </DataGridHeader>
                                <DataGridRow columns="1.3fr 1fr 1fr 0.8fr">
                                    <span className="font-semibold">
                                        Bande 3
                                    </span>
                                    <span className="num text-right">60</span>
                                    <span className="num text-right text-pos">
                                        7 %
                                    </span>
                                    <span className="num text-right">
                                        374 000
                                    </span>
                                </DataGridRow>
                                <DataGridRow columns="1.3fr 1fr 1fr 0.8fr">
                                    <span className="font-semibold">
                                        Bande 4
                                    </span>
                                    <span className="num text-right">80</span>
                                    <span className="num text-right text-pos">
                                        4 %
                                    </span>
                                    <span className="num text-right text-muted">
                                        en cours
                                    </span>
                                </DataGridRow>
                            </CardContent>
                        </Card>
                    </Section>

                    <Section title="Timeline & état vide">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Calendrier type
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Timeline steps={timelineSteps} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <EmptyState
                                        title="Aucun flux ne correspond à ces filtres."
                                        description="Essayez d'élargir la période ou le projet sélectionné."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Section title="Navigation (Sidebar, Topbar, en-têtes)">
                        <div className="flex gap-4 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow)]">
                            <NavSidebar
                                navItems={NAV_ITEMS}
                                projects={demoProjects}
                                newProjectHref="#"
                                activeTimer={{
                                    projectName: 'Poulets de chair',
                                    elapsedLabel: '00:42:10',
                                    onStop: () => {},
                                }}
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <TopBar
                                    syncLabel="Synchronisé · il y a 2 min"
                                    onNoteEntry={() => {}}
                                />
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
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section
                        title="Graphiques"
                        description="SVG maison — role=img + aria-label, labels HTML positionnés en %, aucune librairie."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Sparkline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Sparkline
                                        points={sparklinePoints}
                                        color="var(--b1)"
                                        ariaLabel="Trajectoire en dents de scie qui monte à chaque bande vendue"
                                    />
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

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Multi-courbes (avec infobulle)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MultiLineChart
                                        ariaLabel="Résultat cumulé par projet, mars à octobre"
                                        domain={{
                                            x0: 0,
                                            x1: 7,
                                            y0: -400,
                                            y1: 1000,
                                        }}
                                        series={lineSeries}
                                        yTicks={[-200, 0, 400, 800].map(
                                            (v) => ({
                                                value: v,
                                                label:
                                                    v === 0
                                                        ? '0'
                                                        : `${v > 0 ? '+' : '−'}${Math.abs(v)} k`,
                                            }),
                                        )}
                                        zeroDashed
                                        hoverIndex={hoverIndex}
                                        onHoverIndex={setHoverIndex}
                                        tooltip={
                                            hoverIndex !== undefined && (
                                                <>
                                                    <span className="num text-[11.5px] text-muted">
                                                        // fin{' '}
                                                        {
                                                            multiLineMonths[
                                                                hoverIndex
                                                            ]
                                                        }
                                                    </span>
                                                    {multiLineSeries.map(
                                                        (s) => (
                                                            <span
                                                                key={s.name}
                                                                className="flex items-center gap-2 text-xs"
                                                            >
                                                                <span
                                                                    className="size-2 rounded-sm"
                                                                    style={{
                                                                        background:
                                                                            s.color,
                                                                    }}
                                                                />
                                                                <span className="flex-1">
                                                                    {s.name}
                                                                </span>
                                                                <span className="num">
                                                                    {s.points[
                                                                        hoverIndex
                                                                    ] === null
                                                                        ? '—'
                                                                        : s
                                                                              .points[
                                                                              hoverIndex
                                                                          ]}
                                                                </span>
                                                            </span>
                                                        ),
                                                    )}
                                                </>
                                            )
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Multi-courbes (pesées)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MultiLineChart
                                        ariaLabel="Poids moyen par bande, J7 à J45"
                                        domain={{
                                            x0: 0,
                                            x1: 48,
                                            y0: 0,
                                            y1: 2.2,
                                        }}
                                        height={160}
                                        series={weightLines}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Aire en escalier (ma poche)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StepAreaChart
                                        ariaLabel="Argent engagé : de 650 000 Ar en mars à 1 680 000 Ar aujourd'hui"
                                        domain={{ x1: 228, y1: 2000 }}
                                        events={pocketEvents}
                                        tags={pocketTags}
                                        yTicks={[500, 1000, 1500, 2000].map(
                                            (v) => ({
                                                value: v,
                                                label: `${(v / 1000).toString().replace('.', ',')} M`,
                                            }),
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Ligne en escalier (effectif)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StepLineChart
                                        ariaLabel="Effectif de la bande 4 : 80 au départ, 3 morts, 77 aujourd'hui"
                                        domain={{ xMax: 56, yMax: 90 }}
                                        start={headcountStart}
                                        events={headcountEvents}
                                        projection={{
                                            currentDay: 21,
                                            planDay: 45,
                                        }}
                                        yTicks={[0, 30, 60, 90].map((v) => ({
                                            value: v,
                                            label: String(v),
                                        }))}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Barres appariées (pondus/vendus)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PairedBars
                                        ariaLabel="Œufs pondus et vendus par jour"
                                        days={pairedBarsDays.map((d, i) => ({
                                            ...d,
                                            ariaLabel: `${d.label} : ${d.a} pondus, ${d.b} vendus`,
                                            selected: selectedDay === i,
                                            onClick: () => setSelectedDay(i),
                                        }))}
                                        colorA="var(--b2)"
                                        colorB="var(--c1)"
                                        yMax={40}
                                        target={23}
                                        yTicks={[0, 10, 20, 30, 40].map(
                                            (v) => ({
                                                value: v,
                                                label: String(v),
                                            }),
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Barres mensuelles (avec jalons)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MonthlyBars
                                        ariaLabel="Ventes et dépenses mois après mois"
                                        maxValue={280}
                                        months={monthlyBarsMonths.map((m) => ({
                                            label: m.label,
                                            inValue: m.in,
                                            outValue: m.out,
                                            inTitle: `Ventes ${m.label} : ${m.in} 000 Ar`,
                                            outTitle: `Dépenses ${m.label} : ${m.out} 000 Ar`,
                                            result: m.result,
                                            resultPositive: true,
                                        }))}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Barres divergentes (Ar / heure)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DivergingBars
                                        ariaLabel="Résultat par heure passée, par projet"
                                        rows={divergingRows}
                                        maxAbs={7500}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Barre empilée (coût par poste)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StackedBar
                                        ariaLabel="Répartition du coût : animaux, aliment, soins, litière"
                                        segments={costSegments}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Liste à barres horizontales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <HBarList
                                        ariaLabel="Coût par œuf, semaine après semaine"
                                        rows={eggCostWeeks}
                                        max={1030}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Bande des 7 jours
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <WeekStrip
                                        ariaLabel="Tâches des 7 prochains jours"
                                        days={weekStripDays}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Section>
                </div>
            </div>
        </>
    );
}
