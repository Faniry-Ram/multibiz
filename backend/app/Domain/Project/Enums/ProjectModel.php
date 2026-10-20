<?php

namespace App\Domain\Project\Enums;

/**
 * The template a project is created from — determines which modules (batches, herd
 * production, ...) are enabled by default. See docs/audit-architecture.md.
 */
enum ProjectModel: string
{
    case Lots = 'lots';
    case Herd = 'herd';
    case Resale = 'resale';
    case Simple = 'simple';

    /**
     * French display label, per the model choice cards in
     * resources/js/pages/projects/create.tsx (`MODELS`) — keep the two in sync.
     */
    public function label(): string
    {
        return match ($this) {
            self::Lots => 'Élevage par lots',
            self::Herd => 'Élevage par effectif',
            self::Resale => 'Revente avec stock',
            self::Simple => 'Projet simple',
        };
    }
}
