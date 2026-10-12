import { Form } from '@inertiajs/react';
import { useState } from 'react';
import EntryController from '@/actions/App/Http/Web/Controllers/EntryController';
import type { Category } from '@/components/category-form-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatAmount } from '@/lib/format';
import type { SidebarProject } from '@/types';

type UiType = 'sale' | 'depense' | 'invest' | 'poche' | 'effectif' | 'note';

export type EntryType =
    | 'sale'
    | 'expense'
    | 'investment'
    | 'owner_in'
    | 'owner_out'
    | 'headcount'
    | 'production'
    | 'note';

export type Entry = {
    id: string;
    category_name: string | null;
    type: EntryType;
    amount_formatted: string | null;
    quantity: number | null;
    unit: string | null;
    occurred_at: string;
    note: string | null;
    reverses_entry_id: string | null;
};

type Batch = { id: string; label: string; alive?: number };

const TYPES: {
    key: UiType;
    label: string;
    dot: string;
    hint: string;
}[] = [
    {
        key: 'sale',
        label: 'Vente',
        dot: 'var(--pos)',
        hint: 'Entre dans le résultat du projet. Le prix unitaire sert à repérer quand vous vendez mieux ou moins bien.',
    },
    {
        key: 'depense',
        label: 'Dépense',
        dot: 'var(--neg)',
        hint: 'Sort de la caisse du projet et compte dans le résultat.',
    },
    {
        key: 'invest',
        label: 'Invest.',
        dot: 'var(--primary-text)',
        hint: "Matériel durable : il est remboursé sur la durée, il n'écrase pas le résultat du mois où vous l'achetez.",
    },
    {
        key: 'poche',
        label: 'Poche',
        dot: 'var(--c1)',
        hint: 'Argent qui passe entre votre poche et le projet. Ne change pas le résultat, seulement ce que le projet vous doit.',
    },
    {
        key: 'effectif',
        label: 'Effectif',
        dot: 'var(--warn)',
        hint: "Pertes, entrées ou réformes d'animaux : met à jour l'effectif du lot et le taux de pertes.",
    },
    {
        key: 'note',
        label: 'Note',
        dot: 'var(--muted)',
        hint: 'Une observation sans montant, pour se souvenir du contexte quand on relira l’historique.',
    },
];

const SENS = ['Apport (je mets)', 'Retrait (je reprends)'];
const MOUVEMENTS: { label: string; reason: string; sign: 1 | -1 }[] = [
    { label: 'Perte', reason: 'death', sign: -1 },
    { label: 'Entrée', reason: 'entry', sign: 1 },
    { label: 'Réforme', reason: 'cull', sign: -1 },
];
const LIVES = [
    { label: '1 an', months: 12 },
    { label: '2 ans', months: 24 },
    { label: '3 ans', months: 36 },
];

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function chipClass(on: boolean): string {
    return on
        ? 'h-8.5 rounded-[9px] bg-primary-soft px-3 text-[13px] font-semibold text-primary-text shadow-[inset_0_0_0_1.5px_var(--primary)]'
        : 'h-8.5 rounded-[9px] border border-border px-3 text-[13px] text-text2';
}

type EntryFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batches?: Batch[];
} & (
    | { project: { id: string }; categories: Category[]; projects?: undefined }
    | {
          projects: SidebarProject[];
          project?: undefined;
          categories?: undefined;
      }
);

export function EntryFormDialog({
    open,
    onOpenChange,
    batches = [],
    ...props
}: EntryFormDialogProps) {
    const [type, setType] = useState<UiType>('depense');
    const [sens, setSens] = useState(0);
    const [mouvement, setMouvement] = useState(0);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [qty, setQty] = useState('2');
    const [price, setPrice] = useState('32000');
    const [amount, setAmount] = useState('120000');
    const [life, setLife] = useState(0);
    const [batchId, setBatchId] = useState<string | undefined>(batches[0]?.id);
    const [headcountN, setHeadcountN] = useState(1);
    const [submitMode, setSubmitMode] = useState<'close' | 'again'>('close');
    const [selectedProjectId, setSelectedProjectId] = useState(
        props.projects ? props.projects[0]?.id : undefined,
    );

    const selectedProject = props.projects
        ? props.projects.find((p) => p.id === selectedProjectId)
        : undefined;
    const projectId = props.projects ? selectedProject?.id : props.project.id;
    const categories = props.projects
        ? (selectedProject?.categories ?? [])
        : props.categories;

    const categoryKindForType: Record<UiType, Category['kind'] | null> = {
        sale: 'income',
        depense: 'expense',
        invest: 'investment',
        poche: null,
        effectif: null,
        note: null,
    };
    const relevantKind = categoryKindForType[type];
    const filteredCategories = relevantKind
        ? categories.filter((c) => c.kind === relevantKind)
        : [];

    const backendType: EntryType =
        type === 'depense'
            ? 'expense'
            : type === 'invest'
              ? 'investment'
              : type === 'poche'
                ? sens === 0
                    ? 'owner_in'
                    : 'owner_out'
                : type === 'effectif'
                  ? 'headcount'
                  : type;

    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const qpTotal = q * p;
    const amt = parseFloat(amount) || 0;
    const selectedBatch = batches.find((b) => b.id === batchId);
    const signedDelta = headcountN * MOUVEMENTS[mouvement].sign;

    let sumRight = '';
    let sumTone: 'pos' | 'neg' | 'default' = 'default';
    if (type === 'sale') {
        sumRight = `+ ${formatAmount(qpTotal)} Ar`;
        sumTone = 'pos';
    } else if (type === 'depense' || type === 'invest') {
        sumRight = `− ${formatAmount(type === 'depense' ? qpTotal : amt)} Ar`;
        sumTone = 'neg';
    } else if (type === 'poche') {
        sumRight = `${sens === 0 ? 'apport' : 'retrait'} ${formatAmount(amt)} Ar`;
    } else if (type === 'effectif') {
        sumRight = `${signedDelta > 0 ? '+' : '−'} ${Math.abs(signedDelta)} ${Math.abs(signedDelta) > 1 ? 'animaux' : 'animal'}`;
    } else {
        sumRight = 'sans montant';
    }

    if (props.projects && !projectId) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Noter un flux</DialogTitle>
                    </DialogHeader>
                    <div className="px-5 py-4">
                        <EmptyState
                            title="Aucun projet pour l'instant"
                            description="Créez un projet avant de pouvoir noter un flux."
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex flex-col gap-0.5">
                        <DialogTitle>Noter un flux</DialogTitle>
                        <span className="text-[13px] text-muted">
                            Tout ce qui entre, sort ou change dans un projet.
                        </span>
                    </div>
                </DialogHeader>

                <Form
                    {...EntryController.store.form(projectId as string)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => {
                        if (submitMode === 'close') {
                            onOpenChange(false);
                        }
                    }}
                    resetOnSuccess
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-4 px-5 py-4">
                                {props.projects && (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="global-project">
                                                Projet
                                            </Label>
                                            <Select
                                                value={selectedProjectId}
                                                onValueChange={
                                                    setSelectedProjectId
                                                }
                                            >
                                                <SelectTrigger
                                                    id="global-project"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {props.projects.map((p) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={p.id}
                                                        >
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {batches.length > 0 && (
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="global-batch">
                                                    Lot
                                                </Label>
                                                <Select
                                                    value={batchId}
                                                    onValueChange={setBatchId}
                                                >
                                                    <SelectTrigger
                                                        id="global-batch"
                                                        className="w-full"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {batches.map((b) => (
                                                            <SelectItem
                                                                key={b.id}
                                                                value={b.id}
                                                            >
                                                                {b.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <input
                                    type="hidden"
                                    name="type"
                                    value={backendType}
                                />

                                <div
                                    role="radiogroup"
                                    aria-label="Type de flux"
                                    className="grid grid-cols-3 gap-1.5"
                                >
                                    {TYPES.map((t) => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={type === t.key}
                                            onClick={() => setType(t.key)}
                                            className={
                                                type === t.key
                                                    ? 'flex h-9.5 items-center justify-center gap-1.5 rounded-[9px] bg-primary-soft text-[13px] font-semibold text-text shadow-[inset_0_0_0_2px_var(--primary)]'
                                                    : 'flex h-9.5 items-center justify-center gap-1.5 rounded-[9px] border border-border text-[13px] text-text2'
                                            }
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="size-2 rounded-[3px]"
                                                style={{ background: t.dot }}
                                            />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="m-0 text-[12.5px] leading-relaxed text-muted">
                                    {TYPES.find((t) => t.key === type)?.hint}
                                </p>

                                {type === 'poche' && (
                                    <div
                                        role="radiogroup"
                                        aria-label="Sens"
                                        className="flex gap-1.5"
                                    >
                                        {SENS.map((label, i) => (
                                            <button
                                                key={label}
                                                type="button"
                                                role="radio"
                                                aria-checked={sens === i}
                                                onClick={() => setSens(i)}
                                                className={
                                                    chipClass(sens === i) +
                                                    ' flex-1 text-center'
                                                }
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(type === 'sale' || type === 'depense') &&
                                    filteredCategories.length > 0 && (
                                        <div className="flex flex-col gap-1.5">
                                            <Label>
                                                {type === 'sale'
                                                    ? 'Ce qui est vendu'
                                                    : 'Catégorie'}
                                            </Label>
                                            <input
                                                type="hidden"
                                                name="category_id"
                                                value={category ?? ''}
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {filteredCategories.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        aria-pressed={
                                                            category === c.id
                                                        }
                                                        onClick={() =>
                                                            setCategory(c.id)
                                                        }
                                                        className={chipClass(
                                                            category === c.id,
                                                        )}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.category_id}
                                            />
                                        </div>
                                    )}

                                {(type === 'sale' || type === 'depense') && (
                                    <div className="grid grid-cols-3 items-end gap-2.5">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="quantity">
                                                Quantité
                                            </Label>
                                            <Input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                step="any"
                                                min="0"
                                                required
                                                value={qty}
                                                onChange={(e) =>
                                                    setQty(e.target.value)
                                                }
                                                className="num h-10.5"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="unit_price">
                                                Prix unitaire
                                            </Label>
                                            <Input
                                                id="unit_price"
                                                name="unit_price"
                                                type="number"
                                                step="any"
                                                min="0"
                                                required
                                                value={price}
                                                onChange={(e) =>
                                                    setPrice(e.target.value)
                                                }
                                                className="num h-10.5"
                                            />
                                        </div>
                                        <span
                                            className={
                                                'num flex h-10.5 items-center rounded-lg px-3 text-[15px] font-medium whitespace-nowrap ' +
                                                (type === 'sale'
                                                    ? 'bg-pos-soft text-pos'
                                                    : 'bg-neg-soft text-neg')
                                            }
                                        >
                                            = {formatAmount(qpTotal)} Ar
                                        </span>
                                        {type === 'depense' && (
                                            <input
                                                type="hidden"
                                                name="amount"
                                                value={qpTotal || ''}
                                            />
                                        )}
                                        <InputError message={errors.quantity} />
                                        <InputError
                                            message={errors.unit_price}
                                        />
                                    </div>
                                )}

                                {(type === 'invest' || type === 'poche') && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="amount">
                                            Montant (Ar)
                                        </Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            step="any"
                                            min="0"
                                            required
                                            value={amount}
                                            onChange={(e) =>
                                                setAmount(e.target.value)
                                            }
                                            className="num h-13 rounded-[11px] text-[22px] font-medium"
                                        />
                                        <InputError message={errors.amount} />
                                    </div>
                                )}

                                {type === 'invest' && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Durée d'usage estimée</Label>
                                        <input
                                            type="hidden"
                                            name="useful_life_months"
                                            value={LIVES[life].months}
                                        />
                                        <div className="flex gap-1.5">
                                            {LIVES.map((l, i) => (
                                                <button
                                                    key={l.label}
                                                    type="button"
                                                    aria-pressed={life === i}
                                                    onClick={() => setLife(i)}
                                                    className={chipClass(
                                                        life === i,
                                                    )}
                                                >
                                                    {l.label}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="num text-xs text-muted">
                                            ≈{' '}
                                            {formatAmount(
                                                amt / LIVES[life].months,
                                            )}{' '}
                                            Ar par mois imputés au projet
                                            pendant {LIVES[life].label}
                                        </span>
                                        <InputError
                                            message={errors.useful_life_months}
                                        />
                                    </div>
                                )}

                                {type === 'effectif' && (
                                    <>
                                        {!props.projects &&
                                            batches.length > 0 && (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label htmlFor="batch_id">
                                                        Lot
                                                    </Label>
                                                    <Select
                                                        name="batch_id"
                                                        value={batchId}
                                                        onValueChange={
                                                            setBatchId
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id="batch_id"
                                                            className="w-full"
                                                        >
                                                            <SelectValue placeholder="Choisir une bande" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {batches.map(
                                                                (batch) => (
                                                                    <SelectItem
                                                                        key={
                                                                            batch.id
                                                                        }
                                                                        value={
                                                                            batch.id
                                                                        }
                                                                    >
                                                                        {
                                                                            batch.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={
                                                            errors.batch_id
                                                        }
                                                    />
                                                </div>
                                            )}
                                        {props.projects && (
                                            <input
                                                type="hidden"
                                                name="batch_id"
                                                value={batchId ?? ''}
                                            />
                                        )}

                                        <div
                                            role="radiogroup"
                                            aria-label="Mouvement"
                                            className="flex gap-1.5"
                                        >
                                            {MOUVEMENTS.map((m, i) => (
                                                <button
                                                    key={m.label}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={
                                                        mouvement === i
                                                    }
                                                    onClick={() =>
                                                        setMouvement(i)
                                                    }
                                                    className={
                                                        chipClass(
                                                            mouvement === i,
                                                        ) + ' flex-1'
                                                    }
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="hidden"
                                            name="headcount_reason"
                                            value={MOUVEMENTS[mouvement].reason}
                                        />
                                        <input
                                            type="hidden"
                                            name="headcount_delta"
                                            value={signedDelta}
                                        />

                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2.5">
                                            <span className="text-[13.5px] font-semibold">
                                                Nombre d'animaux
                                            </span>
                                            <NumberStepper
                                                value={headcountN}
                                                onChange={setHeadcountN}
                                                min={1}
                                            />
                                        </div>
                                        {selectedBatch?.alive !== undefined && (
                                            <span className="num text-xs text-muted">
                                                Effectif : {selectedBatch.alive}{' '}
                                                →{' '}
                                                {selectedBatch.alive +
                                                    signedDelta}
                                            </span>
                                        )}
                                        <InputError
                                            message={errors.headcount_delta}
                                        />
                                        <InputError
                                            message={errors.headcount_reason}
                                        />
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="occurred_at">
                                            Date
                                        </Label>
                                        <Input
                                            id="occurred_at"
                                            name="occurred_at"
                                            type="date"
                                            required
                                            defaultValue={today()}
                                        />
                                        <InputError
                                            message={errors.occurred_at}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="note">
                                            Note{' '}
                                            {type !== 'note' && (
                                                <span className="font-normal text-muted">
                                                    · facultatif
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id="note"
                                            name="note"
                                            required={type === 'note'}
                                            placeholder="Détail du flux"
                                        />
                                        <InputError message={errors.note} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <span className="flex items-center justify-between gap-2.5 text-[13px]">
                                    <span className="text-muted">
                                        {selectedProject?.name}
                                    </span>
                                    <span
                                        className={
                                            'num font-semibold ' +
                                            (sumTone === 'pos'
                                                ? 'text-pos'
                                                : sumTone === 'neg'
                                                  ? 'text-neg'
                                                  : 'text-text')
                                        }
                                    >
                                        {sumRight}
                                    </span>
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="flex-1"
                                        disabled={processing}
                                        onClick={() => setSubmitMode('again')}
                                    >
                                        Enregistrer et noter un autre
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={processing}
                                        onClick={() => setSubmitMode('close')}
                                    >
                                        Enregistrer
                                    </Button>
                                </div>
                                <span className="text-xs leading-relaxed text-muted">
                                    Un flux enregistré ne s'efface pas : on le
                                    corrige par un flux inverse, visible dans
                                    l'historique.
                                </span>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
