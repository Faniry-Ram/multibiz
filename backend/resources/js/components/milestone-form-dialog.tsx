import { Form } from '@inertiajs/react';
import { useState } from 'react';
import MilestoneController from '@/actions/App/Http/Web/Controllers/MilestoneController';
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
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SidebarProject } from '@/types';

const KIND_LABELS: Record<string, string> = {
    supplier: 'Fournisseur',
    price: 'Prix de vente',
    method: 'Méthode',
    external: 'Événement extérieur',
};

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export function MilestoneFormDialog({
    open,
    onOpenChange,
    projects,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: SidebarProject[];
}) {
    const [projectId, setProjectId] = useState(projects[0]?.id);
    const [kind, setKind] = useState('method');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex flex-col gap-0.5">
                        <DialogTitle className="flex items-center gap-2.5">
                            <span
                                aria-hidden="true"
                                className="size-3 rotate-45 rounded-[2px] bg-primary"
                            />
                            Nouveau jalon
                        </DialogTitle>
                        <DialogDescription>
                            Un changement dont vous voulez mesurer l'effet.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {!projectId ? (
                    <div className="px-5 py-4">
                        <EmptyState
                            title="Aucun projet pour l'instant"
                            description="Créez un projet avant de pouvoir poser un jalon."
                        />
                    </div>
                ) : (
                    <Form
                        {...MilestoneController.store.form(projectId)}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex flex-col gap-4 px-5 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="milestone-project">
                                                Projet
                                            </Label>
                                            <Select
                                                value={projectId}
                                                onValueChange={setProjectId}
                                            >
                                                <SelectTrigger
                                                    id="milestone-project"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map((p) => (
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
                                        <div className="grid gap-2">
                                            <Label htmlFor="occurred_on">
                                                Date du changement
                                            </Label>
                                            <Input
                                                id="occurred_on"
                                                name="occurred_on"
                                                type="date"
                                                required
                                                defaultValue={today()}
                                            />
                                            <InputError
                                                message={errors.occurred_on}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Titre</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            placeholder="ex. Troisième abreuvoir contre la chaleur"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Genre de changement</Label>
                                        <input
                                            type="hidden"
                                            name="kind"
                                            value={kind}
                                        />
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(KIND_LABELS).map(
                                                ([value, label]) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        aria-pressed={
                                                            kind === value
                                                        }
                                                        onClick={() =>
                                                            setKind(value)
                                                        }
                                                        className={
                                                            kind === value
                                                                ? 'h-9 rounded-[9px] bg-primary-soft px-3.5 text-[13px] font-semibold text-primary-text shadow-[inset_0_0_0_1.5px_var(--primary)]'
                                                                : 'h-9 rounded-[9px] border border-border px-3.5 text-[13px] text-text2'
                                                        }
                                                    >
                                                        {label}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                        <InputError message={errors.kind} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Ce qui change, concrètement{' '}
                                            <span className="font-normal text-muted">
                                                · facultatif
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Poser le jalon
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
