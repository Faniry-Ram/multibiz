import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pocket } from '@/routes';

type Movement = {
    id: string;
    project_name: string;
    type: 'owner_in' | 'owner_out';
    amount_formatted: string;
    occurred_at: string;
    note: string | null;
};

function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
        new Date(isoDate),
    );
}

export default function PocketIndex({
    out_formatted,
    in_formatted,
    still_committed_formatted,
    available_formatted,
    movements,
}: {
    out_formatted: string;
    in_formatted: string;
    still_committed_formatted: string;
    available_formatted: string;
    movements: Movement[];
}) {
    return (
        <>
            <Head title="Ma poche" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Ma poche"
                    description="Ce qui est sorti et revenu de votre poche, sur tous les projets."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Sorti de ma poche
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {out_formatted}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Revenu dans ma poche
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {in_formatted}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Encore engagé
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {still_committed_formatted}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Disponible dans les projets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {available_formatted}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Mouvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {movements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aucun apport ni retrait pour l'instant.
                            </p>
                        ) : (
                            movements.map((movement) => (
                                <div
                                    key={movement.id}
                                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                                >
                                    <div className="flex flex-1 flex-wrap items-center gap-3">
                                        <span className="w-24 shrink-0 text-sm text-muted-foreground">
                                            {formatDate(movement.occurred_at)}
                                        </span>
                                        <Badge variant="secondary">
                                            {movement.project_name}
                                        </Badge>
                                        <Badge variant="outline">
                                            {movement.type === 'owner_in'
                                                ? 'Apport'
                                                : 'Retrait'}
                                        </Badge>
                                        {movement.note && (
                                            <span className="truncate text-sm text-muted-foreground">
                                                {movement.note}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {movement.type === 'owner_in'
                                            ? '+'
                                            : '-'}
                                        {movement.amount_formatted}
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PocketIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ma poche',
            href: pocket(),
        },
    ],
};
