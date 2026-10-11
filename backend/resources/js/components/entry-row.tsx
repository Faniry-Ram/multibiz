import { Form } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import EntryController from '@/actions/App/Http/Web/Controllers/EntryController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Entry, EntryType } from '@/components/entry-form-dialog';

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

function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
        new Date(isoDate),
    );
}

/**
 * A single row of the flux history — used both on a project's own "Historique" card
 * and on the organization-wide filterable Historique page (which additionally shows
 * which project the entry belongs to via `showProjectBadge`).
 */
export function EntryRow({
    entry,
    showProjectBadge = false,
}: {
    entry: Entry & { project_name?: string };
    showProjectBadge?: boolean;
}) {
    const [reverseOpen, setReverseOpen] = useState(false);
    const isReversal = !!entry.reverses_entry_id;

    return (
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                    {formatDate(entry.occurred_at)}
                </span>
                {showProjectBadge && entry.project_name && (
                    <Badge variant="secondary">{entry.project_name}</Badge>
                )}
                <Badge variant="outline">{TYPE_LABELS[entry.type]}</Badge>
                {entry.category_name && (
                    <Badge variant="outline">{entry.category_name}</Badge>
                )}
                {isReversal && <Badge variant="outline">Correction</Badge>}
                {entry.note && (
                    <span className="truncate text-sm text-muted-foreground">
                        {entry.note}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                {entry.amount_formatted && (
                    <span className="text-sm font-medium">
                        {entry.amount_formatted}
                    </span>
                )}
                {entry.quantity !== null && (
                    <span className="text-sm text-muted-foreground">
                        {entry.quantity} {entry.unit}
                    </span>
                )}

                {!isReversal && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setReverseOpen(true)}
                            >
                                Corriger (flux inverse)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <Dialog open={reverseOpen} onOpenChange={setReverseOpen}>
                <DialogContent>
                    <DialogTitle>Corriger ce flux ?</DialogTitle>
                    <DialogDescription>
                        Un flux inverse sera enregistré pour annuler son effet.
                        Le flux original reste dans l'historique : rien n'est
                        modifié ni supprimé.
                    </DialogDescription>
                    <Form
                        {...EntryController.reverse.form(entry.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Confirmer
                                </Button>
                            </DialogFooter>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
