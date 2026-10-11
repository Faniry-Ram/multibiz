import { Head, router, setLayoutProps } from '@inertiajs/react';
import {
    ArrowRight,
    Bird,
    Boxes,
    Check,
    Repeat2,
    ShoppingBag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChoiceCard } from '@/components/ui/choice-card';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ProjectAvatar } from '@/components/ui/project-avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { formatAmount, formatDueIn, formatShortDate } from '@/lib/format';
import { store } from '@/routes/projects';

type ProjectModel = 'lots' | 'herd' | 'resale' | 'simple';

type ModelDef = {
    title: string;
    desc: string;
    ex: string;
    icon: typeof Boxes;
    track: string[];
    unitQ: string;
    units: string[];
    defaultMods: string[];
    tabs: string[];
};

const MODELS: Record<ProjectModel, ModelDef> = {
    lots: {
        title: 'Élevage par lots',
        desc: 'Chaque bande a un début, une fin et un coût par tête. Idéal pour comparer les bandes entre elles.',
        ex: "poulets de chair, cailles, porcs d'engraissement",
        icon: Boxes,
        track: [
            'Coût et marge de chaque bande',
            'Pertes et pesées',
            'Recette type pour planifier la suivante',
        ],
        unitQ: 'Comment appelez-vous un cycle ?',
        units: ['Bande', 'Lot', 'Cycle'],
        defaultMods: ['lots', 'stock', 'recette', 'rappels', 'temps'],
        tabs: [
            "Vue d'ensemble",
            'Lots',
            'Ressources',
            'Planifier',
            'Historique',
        ],
    },
    herd: {
        title: 'Élevage par effectif',
        desc: "Un troupeau qui vit en continu. On suit l'effectif et ce qu'il produit chaque jour.",
        ex: 'pondeuses, lapins, vaches laitières',
        icon: Bird,
        track: [
            'Effectif : entrées, pertes, réformes',
            'Production par jour et taux',
            'Coût par œuf, par litre ou par kg',
        ],
        unitQ: 'Qu’est-ce que le troupeau produit ?',
        units: ['Œufs', 'Litres de lait', 'Kg de viande'],
        defaultMods: ['effectif', 'stock', 'rappels', 'temps'],
        tabs: ["Vue d'ensemble", 'Effectif', 'Ressources', 'Historique'],
    },
    resale: {
        title: 'Revente avec stock',
        desc: 'Acheter, stocker, revendre. On suit la marge de chaque produit et ce qui dort en stock.',
        ex: 'téléphones, écouteurs, vêtements',
        icon: ShoppingBag,
        track: [
            'Marge par produit',
            'Stock qui dort et ruptures',
            'Ventes par semaine et par canal',
        ],
        unitQ: 'Vous vendez comment ?',
        units: ["À l'unité", 'Au kg', 'Par lot'],
        defaultMods: ['produits', 'stock', 'temps'],
        tabs: ["Vue d'ensemble", 'Ressources et stock', 'Historique'],
    },
    simple: {
        title: 'Projet simple',
        desc: "Juste des entrées et des sorties d'argent, sans stock ni animaux. Des modules s'ajoutent plus tard si besoin.",
        ex: 'service, petites missions, location',
        icon: Repeat2,
        track: [
            'Recettes et dépenses',
            'Résultat par mois',
            'Temps passé et Ar par heure',
        ],
        unitQ: "Comment comptez-vous l'activité ?",
        units: ['Par mission', 'Par heure', 'Par mois'],
        defaultMods: ['temps'],
        tabs: ["Vue d'ensemble", 'Historique'],
    },
};

const COLORS: { hex: string; label: string }[] = [
    { hex: '#D97706', label: 'Ambre' },
    { hex: '#DB2777', label: 'Rose' },
    { hex: '#0891B2', label: 'Cyan' },
    { hex: '#7C3AED', label: 'Violet' },
    { hex: '#65A30D', label: 'Olive' },
    { hex: '#475569', label: 'Ardoise' },
];

const MODULES: { id: string; label: string; desc: string }[] = [
    {
        id: 'lots',
        label: 'Lots / bandes',
        desc: 'Début, fin, effectif et marge de chaque cycle',
    },
    {
        id: 'effectif',
        label: 'Effectif et production',
        desc: 'Entrées, pertes, réformes et production du jour',
    },
    {
        id: 'stock',
        label: 'Ressources et stock',
        desc: 'Achats mis en stock, coût ajouté à chaque utilisation',
    },
    {
        id: 'recette',
        label: 'Recette type et simulateur',
        desc: "Ce qu'il faut pour une bande, et ce qu'elle rapporterait",
    },
    {
        id: 'produits',
        label: 'Produits et marge',
        desc: "Prix d'achat, prix de vente et marge par produit",
    },
    {
        id: 'rappels',
        label: 'Rappels de soins',
        desc: 'Vaccins, vitamines, nettoyage : créés à partir du calendrier',
    },
    {
        id: 'temps',
        label: 'Temps passé',
        desc: 'Chrono sur le téléphone, Ar gagnés par heure',
    },
];

type GoalType = 'capital' | 'marge' | 'qty' | 'pertes';

const STEP_LABELS = ['Modèle', 'Identité', 'Objectif'];

const DRAFT_KEY = 'multibiz:project-wizard-draft';

type Draft = {
    model: ProjectModel;
    color: number;
    unit: number;
    name: string;
    start: string;
    capital: string;
    note: string;
    goal: GoalType;
    target: string;
    deadline: string;
    mods: Record<string, boolean>;
};

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function defaultDraft(): Draft {
    const mods: Record<string, boolean> = {};
    MODULES.forEach((m) => {
        mods[m.id] = MODELS.lots.defaultMods.includes(m.id);
    });

    return {
        model: 'lots',
        color: 0,
        unit: 0,
        name: '',
        start: today(),
        capital: '',
        note: '',
        goal: 'capital',
        target: '',
        deadline: '',
        mods,
    };
}

function loadDraft(): Draft {
    if (typeof window === 'undefined') {
        return defaultDraft();
    }

    try {
        const raw = window.localStorage.getItem(DRAFT_KEY);

        if (!raw) {
            return defaultDraft();
        }

        return { ...defaultDraft(), ...(JSON.parse(raw) as Partial<Draft>) };
    } catch {
        return defaultDraft();
    }
}

export default function ProjectsCreate({
    usedColors = [],
}: {
    usedColors?: string[];
}) {
    const [step, setStep] = useState(1);
    const [draft, setDraft] = useState<Draft>(() => loadDraft());
    const [hasDraft, setHasDraft] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setHasDraft(true);
    }, [draft]);

    setLayoutProps({
        draftLabel: hasDraft ? 'brouillon enregistré' : undefined,
    });

    const model = MODELS[draft.model];
    const name = draft.name.trim() || 'Nouveau projet';
    const color = COLORS[draft.color]?.hex ?? COLORS[0].hex;
    const capital = parseFloat(draft.capital) || 0;
    const target = parseFloat(draft.target) || 0;
    const unitWord = model.units[draft.unit]?.toLowerCase() ?? '';

    const daysLeft = useMemo(() => {
        if (!draft.deadline) return null;
        const d = new Date(`${draft.deadline}T00:00:00`);
        if (Number.isNaN(d.getTime())) return null;
        return Math.round((d.getTime() - Date.now()) / 86400000);
    }, [draft.deadline]);

    const goalLine: Record<GoalType, string> = {
        capital: `Récupérer ${formatAmount(target)} Ar`,
        marge: `Marge de ${formatAmount(target)} Ar ${draft.model === 'lots' ? 'par bande' : 'par mois'}`,
        qty: `Vendre ${formatAmount(target)} ${unitWord}`,
        pertes: `Moins de ${target} % de pertes`,
    };

    function pickModel(key: ProjectModel) {
        const mods: Record<string, boolean> = {};
        MODULES.forEach((m) => {
            mods[m.id] = MODELS[key].defaultMods.includes(m.id);
        });
        setDraft((d) => ({ ...d, model: key, unit: 0, mods }));
    }

    function submit() {
        setProcessing(true);

        router.post(
            store().url,
            {
                name,
                model: draft.model,
                color,
                started_on: draft.start,
                unit: model.units[draft.unit],
                capital: draft.capital || undefined,
                note: draft.note || undefined,
            },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => window.localStorage.removeItem(DRAFT_KEY),
            },
        );
    }

    const HEAD: Record<number, [string, string]> = {
        1: [
            'Quel genre de projet lancez-vous ?',
            "Le modèle décide de ce que MultiBiz suit pour vous. Choisissez le plus proche, pas besoin qu'il soit parfait.",
        ],
        2: [
            "Comment s'appelle-t-il ?",
            "Le nom, la couleur et l'argent de départ. Le capital sert à calculer combien le projet vous a déjà rendu.",
        ],
        3: [
            "Qu'est-ce qui dira que ça marche ?",
            'Un objectif daté, et les modules à activer. Tout reste modifiable ensuite.',
        ],
    };

    return (
        <>
            <Head title="Nouveau projet" />

            <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="flex flex-col gap-2">
                    <span className="num text-[12.5px] text-primary-text">
                        // nouveau projet · étape {step} sur 3
                    </span>
                    <h1 className="m-0 text-[32px] leading-[1.15] font-bold tracking-[-0.03em]">
                        {HEAD[step][0]}
                    </h1>
                    <span className="max-w-xl text-[14.5px] leading-relaxed text-muted">
                        {HEAD[step][1]}
                    </span>
                </div>
                <ol
                    aria-label="Étapes"
                    className="m-0 flex list-none items-center gap-2 p-0"
                >
                    {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const done = n < step;
                        const current = n === step;

                        return (
                            <li key={label} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(n)}
                                    aria-current={current ? 'step' : undefined}
                                    className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pr-3 pl-1.5"
                                >
                                    <span
                                        className={
                                            current
                                                ? 'num grid size-[26px] place-items-center rounded-full bg-primary text-[12.5px] font-medium text-white'
                                                : done
                                                  ? 'num grid size-[26px] place-items-center rounded-full bg-pos-soft text-[12.5px] font-medium text-pos'
                                                  : 'num grid size-[26px] place-items-center rounded-full bg-surface2 text-[12.5px] font-medium text-muted'
                                        }
                                    >
                                        {done ? (
                                            <Check className="size-3.5" />
                                        ) : (
                                            n
                                        )}
                                    </span>
                                    <span
                                        className={
                                            current
                                                ? 'text-[13.5px] font-semibold text-text'
                                                : 'text-[13.5px] font-semibold text-muted'
                                        }
                                    >
                                        {label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="flex flex-wrap items-start gap-5.5">
                <section
                    aria-label={HEAD[step][0]}
                    className="flex min-w-0 flex-2 basis-[600px] flex-col gap-5.5 rounded-[18px] border border-border bg-surface p-6.5 shadow-[var(--shadow)]"
                >
                    {step === 1 && (
                        <>
                            <div
                                role="radiogroup"
                                aria-label="Modèle de projet"
                                className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
                            >
                                {(Object.keys(MODELS) as ProjectModel[]).map(
                                    (key) => (
                                        <ChoiceCard
                                            key={key}
                                            icon={MODELS[key].icon}
                                            title={MODELS[key].title}
                                            description={MODELS[key].desc}
                                            meta={MODELS[key].ex}
                                            bullets={MODELS[key].track}
                                            selected={draft.model === key}
                                            onSelect={() => pickModel(key)}
                                        />
                                    ),
                                )}
                            </div>
                            <p className="m-0 text-[13.5px] text-muted">
                                Pas sûr ? Le modèle ne fait qu'activer des
                                modules par défaut : vous pourrez en ajouter ou
                                en retirer dans les réglages du projet.
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
                            <div className="col-span-full flex flex-col gap-1.5">
                                <Label htmlFor="np-name">Nom du projet</Label>
                                <Input
                                    id="np-name"
                                    value={draft.name}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="ex. Cailles, Friperie, Lapins"
                                    className="h-12 rounded-[11px] text-base font-semibold"
                                />
                            </div>

                            <div className="col-span-full flex flex-col gap-2">
                                <span className="text-[13.5px] font-semibold">
                                    Couleur dans les graphiques
                                </span>
                                <div
                                    role="radiogroup"
                                    aria-label="Couleur dans les graphiques"
                                    className="flex flex-wrap gap-2.5"
                                >
                                    {COLORS.map((c, i) => {
                                        const taken = usedColors.includes(
                                            c.hex,
                                        );
                                        const selected = draft.color === i;

                                        return (
                                            <button
                                                key={c.hex}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                aria-label={c.label}
                                                disabled={taken}
                                                onClick={() =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        color: i,
                                                    }))
                                                }
                                                className={
                                                    (selected
                                                        ? 'bg-primary-soft shadow-[inset_0_0_0_2px_var(--primary)] '
                                                        : 'border border-border ') +
                                                    'flex h-10 items-center gap-2 rounded-lg py-0 pr-3 pl-2 disabled:cursor-not-allowed disabled:opacity-55'
                                                }
                                            >
                                                <span
                                                    className="size-[22px] rounded-[7px]"
                                                    style={{
                                                        background: c.hex,
                                                    }}
                                                />
                                                <span className="text-xs text-muted">
                                                    {taken
                                                        ? 'déjà prise'
                                                        : c.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-xs text-muted">
                                    Les couleurs déjà prises restent réservées à
                                    leur projet, pour ne jamais confondre deux
                                    courbes.
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="np-start">Date de début</Label>
                                <DateInput
                                    id="np-start"
                                    value={draft.start}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            start: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="np-cap">
                                    Capital de départ (Ar)
                                </Label>
                                <Input
                                    id="np-cap"
                                    type="number"
                                    min="0"
                                    step="10000"
                                    value={draft.capital}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            capital: e.target.value,
                                        }))
                                    }
                                    className="num"
                                />
                                <span className="text-xs text-muted">
                                    Noté comme un apport de votre poche, pas
                                    comme une dépense.
                                </span>
                            </div>

                            <div className="col-span-full flex flex-col gap-2">
                                <span className="text-[13.5px] font-semibold">
                                    {model.unitQ}
                                </span>
                                <div
                                    role="radiogroup"
                                    aria-label={model.unitQ}
                                    className="flex flex-wrap gap-2"
                                >
                                    {model.units.map((u, i) => (
                                        <button
                                            key={u}
                                            type="button"
                                            role="radio"
                                            aria-checked={draft.unit === i}
                                            onClick={() =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    unit: i,
                                                }))
                                            }
                                            className={
                                                draft.unit === i
                                                    ? 'h-10 rounded-[10px] bg-primary-soft px-4 text-sm font-semibold text-primary-text shadow-[inset_0_0_0_2px_var(--primary)]'
                                                    : 'h-10 rounded-[10px] border border-border px-4 text-sm text-text2'
                                            }
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-full flex flex-col gap-1.5">
                                <Label htmlFor="np-note">
                                    Pourquoi je lance ce projet{' '}
                                    <span className="font-normal text-muted">
                                        · facultatif
                                    </span>
                                </Label>
                                <Textarea
                                    id="np-note"
                                    rows={2}
                                    value={draft.note}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            note: e.target.value,
                                        }))
                                    }
                                    placeholder="ex. Tester la demande de cailles au marché d'Andravoahangy avant d'investir plus."
                                />
                                <span className="text-xs text-muted">
                                    Devient le premier jalon de l'historique :
                                    utile pour relire plus tard ce que vous
                                    aviez en tête.
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-5.5">
                            <div className="flex flex-col gap-3">
                                <span className="text-[13.5px] font-semibold">
                                    Objectif principal
                                </span>
                                <div
                                    role="radiogroup"
                                    aria-label="Objectif principal"
                                    className="grid grid-cols-2 gap-2.5"
                                >
                                    {(
                                        [
                                            [
                                                'capital',
                                                'Récupérer mon capital',
                                                "rendre ce que j'ai mis",
                                            ],
                                            [
                                                'marge',
                                                'Atteindre une marge',
                                                draft.model === 'lots'
                                                    ? 'par bande'
                                                    : 'par mois',
                                            ],
                                            [
                                                'qty',
                                                'Vendre une quantité',
                                                "avant l'échéance",
                                            ],
                                            [
                                                'pertes',
                                                'Limiter les pertes',
                                                'ou les invendus',
                                            ],
                                        ] as [GoalType, string, string][]
                                    ).map(([key, label, hint]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            role="radio"
                                            aria-checked={draft.goal === key}
                                            onClick={() =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    goal: key,
                                                }))
                                            }
                                            className={
                                                (draft.goal === key
                                                    ? 'bg-primary-soft shadow-[inset_0_0_0_2px_var(--primary)] '
                                                    : 'shadow-[inset_0_0_0_1px_var(--border)] ') +
                                                'flex flex-col gap-0.5 rounded-xl px-3.5 py-3 text-left'
                                            }
                                        >
                                            <span className="text-sm font-semibold">
                                                {label}
                                            </span>
                                            <span className="text-xs text-muted">
                                                {hint}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="np-target">
                                            Cible (
                                            {draft.goal === 'pertes'
                                                ? '%'
                                                : draft.goal === 'qty'
                                                  ? unitWord
                                                  : 'Ar'}
                                            )
                                        </Label>
                                        <Input
                                            id="np-target"
                                            type="number"
                                            min="0"
                                            value={draft.target}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    target: e.target.value,
                                                }))
                                            }
                                            className="num"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="np-dl">Échéance</Label>
                                        <DateInput
                                            id="np-dl"
                                            value={draft.deadline}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    deadline: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <span className="text-[13px] text-muted">
                                    Sur la vue d'ensemble, l'objectif affichera
                                    « En avance », « En bonne voie » ou « En
                                    retard » selon le rythme réel.
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline justify-between gap-2.5 pb-1.5">
                                    <span className="text-[13.5px] font-semibold">
                                        Modules activés
                                    </span>
                                    <span className="num text-xs text-muted">
                                        {
                                            MODULES.filter(
                                                (m) => draft.mods[m.id],
                                            ).length
                                        }{' '}
                                        sur {MODULES.length}
                                    </span>
                                </div>
                                {MODULES.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center gap-3.5 border-t border-border py-2.5"
                                    >
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="flex items-center gap-2 text-sm font-semibold">
                                                {m.label}
                                                {model.defaultMods.includes(
                                                    m.id,
                                                ) && (
                                                    <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary-text">
                                                        conseillé
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted">
                                                {m.desc}
                                            </span>
                                        </span>
                                        <Switch
                                            checked={!!draft.mods[m.id]}
                                            onCheckedChange={(checked) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    mods: {
                                                        ...d.mods,
                                                        [m.id]: checked,
                                                    },
                                                }))
                                            }
                                            aria-label={m.label}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4.5">
                        <Button
                            variant="outline"
                            disabled={step === 1}
                            className={step === 1 ? 'opacity-40' : undefined}
                            onClick={() => setStep((s) => Math.max(1, s - 1))}
                        >
                            ← Retour
                        </Button>
                        {step < 3 ? (
                            <Button
                                onClick={() =>
                                    setStep((s) => Math.min(3, s + 1))
                                }
                            >
                                Continuer
                            </Button>
                        ) : (
                            <Button
                                onClick={submit}
                                disabled={processing || !draft.name.trim()}
                                className="gap-2"
                            >
                                Créer « {name} »
                                <ArrowRight className="size-4" />
                            </Button>
                        )}
                    </div>
                </section>

                <aside
                    aria-label="Aperçu du projet"
                    className="flex min-w-0 flex-1 basis-[340px] flex-col gap-3.5"
                >
                    <span className="num text-xs text-muted">
                        // aperçu sur la vue d'ensemble
                    </span>
                    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-4.5 shadow-[var(--shadow)]">
                        <div className="flex items-center gap-3">
                            <ProjectAvatar
                                initials={name.slice(0, 2).toLowerCase()}
                                color={color}
                            />
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="truncate text-base font-bold tracking-[-0.02em]">
                                    {name}
                                </span>
                                <span className="text-xs text-muted">
                                    {model.title} · dès le{' '}
                                    {formatShortDate(draft.start)}
                                </span>
                            </span>
                            <VerdictBadge tone="primary" className="shrink-0">
                                En démarrage
                            </VerdictBadge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs text-muted">
                                <span>Capital récupéré</span>
                                <span className="num">
                                    0 / {formatAmount(capital)} Ar
                                </span>
                            </div>
                            <ProgressBar value={2} color="var(--pos)" />
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg p-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[13.5px] font-semibold">
                                    {goalLine[draft.goal]}
                                </span>
                                <span className="shrink-0 rounded-full bg-slate-soft px-2 py-0.5 text-[11.5px] font-semibold text-slate-text">
                                    À venir
                                </span>
                            </div>
                            <span className="num text-xs text-muted">
                                {draft.deadline
                                    ? `avant le ${formatShortDate(draft.deadline)}${
                                          daysLeft !== null && daysLeft > 0
                                              ? ` · ${formatDueIn(daysLeft)}`
                                              : ''
                                      }`
                                    : 'échéance à définir'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {[...model.tabs, 'Réglages'].map((t) => (
                                <span
                                    key={t}
                                    className="rounded-lg border border-border px-2.5 py-1 text-xs text-text2"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5 rounded-2xl bg-primary-soft p-4">
                        <span className="text-[13.5px] font-bold text-primary-text">
                            Ce qui se passe à la création
                        </span>
                        {[
                            `Un apport de ${formatAmount(capital)} Ar est noté dans « Ma poche », daté du ${formatShortDate(draft.start)}.`,
                            draft.model === 'lots'
                                ? `Vous pourrez ouvrir la première ${unitWord || 'bande'} et sa recette type (provende, poussins, vaccins).`
                                : draft.model === 'herd'
                                  ? `Vous saisirez l'effectif de départ, puis la production en ${unitWord} chaque jour.`
                                  : draft.model === 'resale'
                                    ? 'Vous ajouterez vos premiers produits avec leur prix d’achat et de vente.'
                                    : 'Vous noterez vos recettes et dépenses, rien de plus.',
                            'Le projet apparaît sur le téléphone à la prochaine synchronisation, même hors ligne ensuite.',
                        ].map((text, i) => (
                            <span
                                key={text}
                                className="flex gap-2.5 text-[13px] leading-relaxed text-text2"
                            >
                                <span className="num shrink-0 text-primary-text">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {text}
                            </span>
                        ))}
                    </div>
                </aside>
            </div>
        </>
    );
}

ProjectsCreate.layout = { title: 'Nouveau projet' };
