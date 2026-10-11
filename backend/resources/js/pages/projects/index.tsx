import { Form, Head, Link } from '@inertiajs/react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import ProjectController from '@/actions/App/Http/Web/Controllers/ProjectController';
import Heading from '@/components/heading';
import {
    ProjectFormDialog,
    type Project,
} from '@/components/project-form-dialog';
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

const MODEL_LABELS: Record<Project['model'], string> = {
    lots: 'Lots',
    herd: 'Troupeau',
    resale: 'Revente',
    simple: 'Simple',
};

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <>
            <Head title="Projets" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Projets"
                        description="Surveillez chaque projet de votre organisation."
                    />
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus />
                        Nouveau projet
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                        <p className="font-medium">
                            Aucun projet pour l'instant
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Créez votre premier projet pour commencer à
                            surveiller ses flux.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <ProjectFormDialog open={createOpen} onOpenChange={setCreateOpen} />
        </>
    );
}

function ProjectCard({ project }: { project: Project }) {
    const [editOpen, setEditOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className="size-3 shrink-0 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: project.color ?? '#94a3b8' }}
                        aria-hidden
                    />
                    <CardTitle>
                        <Link
                            href={show(project.id)}
                            className="hover:underline"
                        >
                            {project.name}
                        </Link>
                    </CardTitle>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal />
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
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{MODEL_LABELS[project.model]}</Badge>
                {project.status === 'archived' && (
                    <Badge variant="outline">Archivé</Badge>
                )}
            </CardContent>

            <ProjectFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                project={project}
            />
            <ArchiveProjectDialog
                open={archiveOpen}
                onOpenChange={setArchiveOpen}
                project={project}
            />
        </Card>
    );
}

function ArchiveProjectDialog({
    open,
    onOpenChange,
    project,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>Archiver « {project.name} » ?</DialogTitle>
                <DialogDescription>
                    L'historique de ce projet est conservé. Vous pourrez le
                    réactiver plus tard.
                </DialogDescription>

                <Form
                    {...ProjectController.archive.form(project.id)}
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
    );
}

ProjectsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Projets',
            href: projectsIndex(),
        },
    ],
};
