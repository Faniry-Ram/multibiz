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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

type Batch = { id: string; label: string };

const TYPE_LABELS: Record<EntryType, string> = {
    sale: 'Vente',
    expense: 'Dépense',
    investment: 'Investissement',
    owner_in: 'Apport (poche)',
    owner_out: 'Retrait (poche)',
    headcount: "Mouvement d'effectif",
    production: 'Production',
    note: 'Note',
};

const HEADCOUNT_REASON_LABELS: Record<string, string> = {
    death: 'Mort',
    entry: 'Entrée',
    sale: 'Vente',
    cull: 'Réforme',
};

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export function EntryFormDialog({
    open,
    onOpenChange,
    project,
    categories,
    batches = [],
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: string };
    categories: Category[];
    batches?: Batch[];
}) {
    const [type, setType] = useState<EntryType>('expense');

    const categoryKindForType: Record<EntryType, Category['kind'] | null> = {
        sale: 'income',
        expense: 'expense',
        investment: 'investment',
        owner_in: null,
        owner_out: null,
        headcount: null,
        production: null,
        note: null,
    };

    const relevantKind = categoryKindForType[type];
    const filteredCategories = relevantKind
        ? categories.filter((category) => category.kind === relevantKind)
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Noter un flux</DialogTitle>
                </DialogHeader>

                <Form
                    {...EntryController.store.form(project.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    resetOnSuccess
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-4 px-5 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type de flux</Label>
                                    <Select
                                        name="type"
                                        value={type}
                                        onValueChange={(value) =>
                                            setType(value as EntryType)
                                        }
                                    >
                                        <SelectTrigger
                                            id="type"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <InputError message={errors.type} />
                                </div>

                                {relevantKind && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">
                                            Catégorie
                                        </Label>
                                        <Select name="category_id">
                                            <SelectTrigger
                                                id="category_id"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Choisir une catégorie" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCategories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.category_id}
                                        />
                                    </div>
                                )}

                                {(type === 'sale' || type === 'production') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
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
                                                placeholder="0"
                                            />
                                            <InputError
                                                message={errors.quantity}
                                            />
                                        </div>
                                        {type === 'sale' ? (
                                            <div className="grid gap-2">
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
                                                    placeholder="0"
                                                />
                                                <InputError
                                                    message={errors.unit_price}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                <Label htmlFor="unit">
                                                    Unité
                                                </Label>
                                                <Input
                                                    id="unit"
                                                    name="unit"
                                                    placeholder="œufs"
                                                />
                                                <InputError
                                                    message={errors.unit}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(type === 'expense' ||
                                    type === 'investment' ||
                                    type === 'owner_in' ||
                                    type === 'owner_out') && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Montant</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            step="any"
                                            min="0"
                                            required
                                            placeholder="0"
                                        />
                                        <InputError message={errors.amount} />
                                    </div>
                                )}

                                {type === 'investment' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="useful_life_months">
                                            Durée d'usage (mois)
                                        </Label>
                                        <Input
                                            id="useful_life_months"
                                            name="useful_life_months"
                                            type="number"
                                            min="1"
                                            required
                                            placeholder="12"
                                        />
                                        <InputError
                                            message={errors.useful_life_months}
                                        />
                                    </div>
                                )}

                                {type === 'headcount' && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="batch_id">
                                                Bande
                                            </Label>
                                            <Select name="batch_id">
                                                <SelectTrigger
                                                    id="batch_id"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Choisir une bande" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {batches.map((batch) => (
                                                        <SelectItem
                                                            key={batch.id}
                                                            value={batch.id}
                                                        >
                                                            {batch.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.batch_id}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="headcount_delta">
                                                    Variation
                                                </Label>
                                                <Input
                                                    id="headcount_delta"
                                                    name="headcount_delta"
                                                    type="number"
                                                    required
                                                    placeholder="-1"
                                                />
                                                <InputError
                                                    message={
                                                        errors.headcount_delta
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="headcount_reason">
                                                    Raison
                                                </Label>
                                                <Select name="headcount_reason">
                                                    <SelectTrigger
                                                        id="headcount_reason"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Choisir" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(
                                                            HEADCOUNT_REASON_LABELS,
                                                        ).map(
                                                            ([
                                                                value,
                                                                label,
                                                            ]) => (
                                                                <SelectItem
                                                                    key={value}
                                                                    value={
                                                                        value
                                                                    }
                                                                >
                                                                    {label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors.headcount_reason
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="occurred_at">Date</Label>
                                    <Input
                                        id="occurred_at"
                                        name="occurred_at"
                                        type="date"
                                        required
                                        defaultValue={today()}
                                    />
                                    <InputError message={errors.occurred_at} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="note">
                                        Note{type !== 'note' && ' (optionnel)'}
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

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
