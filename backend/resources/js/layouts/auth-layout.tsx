import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { login, register } from '@/routes';

const SHOWCASE_PROJECTS = [
    {
        name: 'Poulets de chair',
        color: '#FCD34D',
        meta: '+ 476 000 Ar · 73 % du capital récupéré',
        verdict: 'Rentable',
        tone: '#047857',
    },
    {
        name: 'Revente en ligne',
        color: '#67E8F9',
        meta: 'marge en baisse depuis août',
        verdict: 'À surveiller',
        tone: '#A16207',
    },
    {
        name: 'Œufs (pondeuses)',
        color: '#F9A8D4',
        meta: 'J56 · 63 % de ponte, ça monte',
        verdict: 'En démarrage',
        tone: '#1D4ED8',
    },
];

const PERKS = [
    'Fonctionne hors ligne sur le téléphone',
    'Historique jamais effacé',
    'Synchronisé dès que le réseau revient',
];

export default function AuthLayout({
    title,
    description,
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const isRegister = isCurrentUrl(register());

    return (
        <div className="flex min-h-dvh flex-wrap bg-bg text-text">
            <section
                aria-label="Présentation de MultiBiz"
                className="flex flex-1 basis-[560px] flex-col gap-10 bg-primary p-10 text-white"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }}
            >
                <div className="flex items-center gap-2.5">
                    <span className="num grid size-[34px] place-items-center rounded-[9px] bg-white text-sm font-medium text-primary">
                        mb
                    </span>
                    <span className="text-[19px] font-bold tracking-[-0.02em]">
                        MultiBiz
                    </span>
                </div>

                <div className="my-auto flex max-w-[520px] flex-col gap-5.5">
                    <span className="num text-[13px] text-[#BFDBFE]">
                        // le carnet de bord de vos petits business
                    </span>
                    <h1 className="m-0 text-[44px] leading-[1.08] font-bold tracking-[-0.035em]">
                        Savoir ce qui marche, et à quel moment.
                    </h1>
                    <p className="m-0 text-[16.5px] leading-relaxed text-[#DBEAFE]">
                        Notez chaque vente, chaque sac de provende, chaque
                        apport. MultiBiz garde tout l'historique et vous montre,
                        projet par projet, ce qui rapporte et ce qui coûte.
                    </p>

                    <div
                        aria-label="Exemple de projets suivis"
                        className="mt-1.5 flex flex-col gap-2.5"
                    >
                        {SHOWCASE_PROJECTS.map((project) => (
                            <div
                                key={project.name}
                                className="flex items-center gap-3.5 rounded-[14px] border border-white/18 bg-white/10 px-4 py-3.5"
                            >
                                <span
                                    aria-hidden="true"
                                    className="size-[11px] shrink-0 rounded-[4px]"
                                    style={{ background: project.color }}
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-[14.5px] font-semibold">
                                        {project.name}
                                    </span>
                                    <span className="num text-xs text-[#BFDBFE]">
                                        {project.meta}
                                    </span>
                                </span>
                                <span
                                    className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold"
                                    style={{ color: project.tone }}
                                >
                                    {project.verdict}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <ul className="m-0 flex list-none flex-wrap gap-x-6.5 gap-y-2.5 p-0 text-[13.5px] text-[#DBEAFE]">
                    {PERKS.map((perk) => (
                        <li key={perk} className="flex items-center gap-2">
                            <Check
                                aria-hidden="true"
                                className="size-[15px] shrink-0"
                                strokeWidth={2.4}
                            />
                            {perk}
                        </li>
                    ))}
                </ul>
            </section>

            <main className="flex flex-1 basis-[520px] flex-col bg-surface p-7 pt-7">
                <div className="flex items-center justify-end gap-2.5">
                    <label htmlFor="auth-lang" className="sr-only">
                        Langue
                    </label>
                    <select
                        id="auth-lang"
                        className="h-10 rounded-lg border border-border bg-surface px-2.5 text-[13.5px]"
                    >
                        <option>Français</option>
                        <option>Malagasy</option>
                    </select>
                    <ThemeToggle />
                </div>

                <div className="mx-auto flex w-full max-w-[410px] flex-col gap-6 py-6">
                    <div
                        role="tablist"
                        aria-label="Connexion ou inscription"
                        className="grid grid-cols-2 gap-1 rounded-xl bg-surface2 p-1"
                    >
                        <Link
                            href={login()}
                            role="tab"
                            aria-selected={!isRegister}
                            className={
                                !isRegister
                                    ? 'h-10 rounded-[9px] bg-surface text-center text-sm font-semibold text-text shadow-[var(--shadow)]'
                                    : 'flex h-10 items-center justify-center rounded-[9px] text-center text-sm text-muted no-underline'
                            }
                        >
                            Se connecter
                        </Link>
                        <Link
                            href={register()}
                            role="tab"
                            aria-selected={isRegister}
                            className={
                                isRegister
                                    ? 'flex h-10 items-center justify-center rounded-[9px] bg-surface text-center text-sm font-semibold text-text shadow-[var(--shadow)]'
                                    : 'flex h-10 items-center justify-center rounded-[9px] text-center text-sm text-muted no-underline'
                            }
                        >
                            Créer un compte
                        </Link>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <h2 className="m-0 text-[28px] font-bold tracking-[-0.03em]">
                            {title}
                        </h2>
                        {description && (
                            <p className="m-0 text-[14.5px] leading-relaxed text-muted">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
