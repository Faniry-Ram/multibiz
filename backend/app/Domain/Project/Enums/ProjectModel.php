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
}
