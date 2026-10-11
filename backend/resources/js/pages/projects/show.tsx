import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import EntryController from '@/actions/App/Http/Web/Controllers/EntryController';
import {
    CategoryFormDialog,
    type Category,
} from '@/components/category-form-dialog';
import CategoryController from '@/actions/App/Http/Web/Controllers/CategoryController';
import { EntryFormDialog, type Entry } from '@/components/entry-form-dialog';
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
import { index as projectsIndex, show } from '@/routes/projects';

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

const TYPE_LABELS: Record<Entry['type'], string> = {
    sale: 'Vente',
    expense: 'Dépense',
    investment: 'Investissement',
    owner_in: 'Apport',
    owner_out: 'Retrait',
    headcount: 'Effectif',
    production: 'Production',
    note: 'Note',
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
}: {
    project: Project;
    categories: Category[];
    entries: Paginated<Entry>;
}) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Projets', href: projectsIndex() },
            { title: project.name, href: show(project.id) },
        ],
    });

    const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
    const [createEntryOpen, setCreateEntryOpen] = useState(false);

    const incomeCategories = categories.filter((c) => c.kind === 'income');
    const expenseCategories = categories.filter((c) => c.kind === 'expense');
    const investmentCategories = categories.filter(
        (c) => c.kind === 'investment',
    );

    return (
        <>
            <Head title={project.name} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <Link
                        href={projectsIndex()}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Projets
                    </Link>
                    <div className="mt-2 flex items-start justify-between gap-4">
                        <Heading
                            title={project.name}
                            description={project.currency}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Catégories</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setCreateCategoryOpen(true)}
                        >
                            <Plus />
                            Nouvelle catégorie
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <CategoryColumn
                                title="Revenus"
                                categories={incomeCategories}
                                project={project}
                            />
                            <CategoryColumn
                                title="Dépenses"
                                categories={expenseCategories}
                                project={project}
                            />
                            <CategoryColumn
                                title="Investissements"
                                categories={investmentCategories}
                                project={project}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Historique</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setCreateEntryOpen(true)}
                            disabled={categories.length === 0}
                        >
                            <Plus />
                            Noter un flux
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {categories.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Créez d'abord une catégorie pour pouvoir noter
                                des flux.
                            </p>
                        )}

                        {categories.length > 0 && entries.data.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aucun flux pour l'instant.
                            </p>
                        )}

                        {entries.data.map((entry) => (
                            <EntryRow key={entry.id} entry={entry} />
                        ))}

                        {entries.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {entries.current_page} /{' '}
                                    {entries.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {entries.prev_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={entries.prev_page_url}
                                                preserveScroll
                                            >
                                                Précédent
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Précédent
                                        </Button>
                                    )}
                                    {entries.next_page_url ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={entries.next_page_url}
                                                preserveScroll
                                            >
                                                Suivant
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Suivant
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
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

function EntryRow({ entry }: { entry: Entry }) {
    const [reverseOpen, setReverseOpen] = useState(false);
    const isReversal = !!entry.reverses_entry_id;

    return (
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                    {formatDate(entry.occurred_at)}
                </span>
                <Badge variant="secondary">{TYPE_LABELS[entry.type]}</Badge>
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
