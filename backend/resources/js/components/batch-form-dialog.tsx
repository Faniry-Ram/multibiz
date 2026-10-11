import { Form } from '@inertiajs/react';
import BatchController from '@/actions/App/Http/Web/Controllers/BatchController';
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

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export function BatchFormDialog({
    open,
    onOpenChange,
    project,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: { id: string };
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ouvrir une bande</DialogTitle>
                </DialogHeader>

                <Form
                    {...BatchController.store.form(project.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    resetOnSuccess
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-4 px-5 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="initial_headcount">
                                        Effectif de départ
                                    </Label>
                                    <Input
                                        id="initial_headcount"
                                        name="initial_headcount"
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="50"
                                    />
                                    <InputError
                                        message={errors.initial_headcount}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Nom (optionnel)
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Bande de printemps"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="started_on">
                                            Date de début
                                        </Label>
                                        <Input
                                            id="started_on"
                                            name="started_on"
                                            type="date"
                                            defaultValue={today()}
                                        />
                                        <InputError
                                            message={errors.started_on}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="planned_end_on">
                                            Fin prévue (optionnel)
                                        </Label>
                                        <Input
                                            id="planned_end_on"
                                            name="planned_end_on"
                                            type="date"
                                        />
                                        <InputError
                                            message={errors.planned_end_on}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Ouvrir
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
