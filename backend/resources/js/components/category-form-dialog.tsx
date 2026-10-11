import { Form } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Web/Controllers/CategoryController';
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

export type Category = {
    id: string;
    name: string;
    kind: 'income' | 'expense' | 'investment';
};

const KIND_LABELS: Record<Category['kind'], string> = {
    income: 'Revenu',
    expense: 'Dépense',
    investment: 'Investissement',
};

export function CategoryFormDialog({
    open,
    onOpenChange,
    project,
    category,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: string };
    category?: Category;
}) {
    const isEditing = !!category;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Modifier la catégorie'
                            : 'Nouvelle catégorie'}
                    </DialogTitle>
                </DialogHeader>

                <Form
                    {...(isEditing
                        ? CategoryController.update.form(category.id)
                        : CategoryController.store.form(project.id))}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    resetOnSuccess
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-4 px-5 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={category?.name}
                                        placeholder="Ventes"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="kind">Type</Label>
                                    <Select
                                        name="kind"
                                        defaultValue={
                                            category?.kind ?? 'expense'
                                        }
                                    >
                                        <SelectTrigger
                                            id="kind"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(KIND_LABELS).map(
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
                                    <InputError message={errors.kind} />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Enregistrer' : 'Créer'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
