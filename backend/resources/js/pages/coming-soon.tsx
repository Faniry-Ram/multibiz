import { Head } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ComingSoon({ title }: { title: string }) {
    return (
        <>
            <Head title={title} />

            <div className="flex flex-col gap-6 px-9 py-7">
                <PageHeader eyebrow="bientôt disponible" title={title} />
                <EmptyState
                    icon={Sparkles}
                    title={`Bientôt : ${title}`}
                    description="Cette page arrive dans une prochaine étape."
                />
            </div>
        </>
    );
}
