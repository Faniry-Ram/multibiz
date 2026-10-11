import { Form } from '@inertiajs/react';
import ProjectController from '@/actions/App/Http/Web/Controllers/ProjectController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

export type Project = {
    id: string;
    name: string;
    model: 'lots' | 'herd' | 'resale' | 'simple';
    color: string | null;
    status: 'active' | 'archived';
};

const MODEL_LABELS: Record<Project['model'], string> = {
    lots: 'Lots (bandes)',
    herd: 'Troupeau',
    resale: 'Revente',
    simple: 'Simple',
};

export function ProjectFormDialog({
    open,
    onOpenChange,
    project,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project;
}) {
    const isEditing = !!project;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Mettez à jour les informations de ce projet.'
                            : 'Ajoutez un projet à surveiller dans votre organisation.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...(isEditing
                        ? ProjectController.update.form(project.id)
                        : ProjectController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    resetOnSuccess
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={project?.name}
                                    placeholder="Poulets de chair"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="model">Modèle</Label>
                                    <Select
                                        name="model"
                                        defaultValue={
                                            project?.model ?? 'simple'
                                        }
                                    >
                                        <SelectTrigger
                                            id="model"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(MODEL_LABELS).map(
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
                                    <InputError message={errors.model} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="color">Couleur</Label>
                                    <Input
                                        id="color"
                                        name="color"
                                        type="color"
                                        className="h-9 w-full p-1"
                                        defaultValue={
                                            project?.color ?? '#2563eb'
                                        }
                                    />
                                    <InputError message={errors.color} />
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
