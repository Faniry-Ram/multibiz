import { Head, Link } from '@inertiajs/react';

import { destroy as logout } from '@/actions/Laravel/Fortify/Http/Controllers/AuthenticatedSessionController';

export default function ComingSoon({ title }: { title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-4 text-center">
                <span className="num text-[12.5px] text-primary-text">
                    // multibiz
                </span>
                <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-text">
                    {title}
                </h1>
                <p className="max-w-sm text-[13.5px] text-muted">
                    Cette page n'a pas encore été reconstruite.
                </p>
                <Link
                    href={logout.url()}
                    method="post"
                    as="button"
                    className="text-[13.5px] font-medium text-primary-text underline-offset-4 hover:underline"
                >
                    Se déconnecter
                </Link>
            </div>
        </>
    );
}
