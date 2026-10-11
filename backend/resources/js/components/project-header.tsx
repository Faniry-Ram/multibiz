import { Link } from '@inertiajs/react';
import * as React from 'react';

import { ProjectAvatar } from '@/components/ui/project-avatar';
import { Tabs } from '@/components/ui/tabs';
import { VerdictBadge, type VerdictTone } from '@/components/ui/verdict-badge';

function ProjectHeader({
    backHref,
    backLabel,
    name,
    color,
    verdictLabel,
    verdictTone,
    modelLabel,
    meta,
    actions,
    tabs,
}: {
    backHref: string;
    backLabel: string;
    name: string;
    color: string;
    verdictLabel: string;
    verdictTone: VerdictTone;
    modelLabel: string;
    meta: string;
    actions?: React.ReactNode;
    tabs: { label: string; href: string; current: boolean }[];
}) {
    return (
        <div className="flex flex-col gap-4">
            <Link
                href={backHref}
                className="num text-[12.5px] text-primary-text no-underline hover:underline"
            >
                ← {backLabel}
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <ProjectAvatar
                        initials={name.slice(0, 2).toLowerCase()}
                        color={color}
                        size="lg"
                    />
                    <div className="flex flex-col gap-1.5">
                        <h1 className="m-0 text-[30px] leading-[1.1] font-bold tracking-[-0.03em]">
                            {name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                            <VerdictBadge tone={verdictTone}>
                                {verdictLabel}
                            </VerdictBadge>
                            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text2">
                                {modelLabel}
                            </span>
                            <span>{meta}</span>
                        </div>
                    </div>
                </div>
                {actions && (
                    <div className="flex flex-wrap gap-2">{actions}</div>
                )}
            </div>
            <Tabs items={tabs} />
        </div>
    );
}

export { ProjectHeader };
