<?php

namespace App\Domain\Project\Actions;

use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;

class UnarchiveProject
{
    public function handle(Project $project): Project
    {
        $project->update(['status' => ProjectStatus::Active]);

        return $project;
    }
}
