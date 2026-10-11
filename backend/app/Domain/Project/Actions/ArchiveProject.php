<?php

namespace App\Domain\Project\Actions;

use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;

/**
 * Projects are never deleted (the flux registry attached to them must survive) — they
 * are archived instead. See docs/audit-architecture.md.
 */
class ArchiveProject
{
    public function handle(Project $project): Project
    {
        $project->update(['status' => ProjectStatus::Archived]);

        return $project;
    }
}
