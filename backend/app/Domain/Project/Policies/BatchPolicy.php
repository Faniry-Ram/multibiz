<?php

namespace App\Domain\Project\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;

class BatchPolicy
{
    public function view(User $user, Batch $batch): bool
    {
        return $this->belongsToUserOrganization($user, $batch->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $this->belongsToUserOrganization($user, $project)
            && ($user->roleIn($project->organization)?->canManageProjects() ?? false);
    }

    public function close(User $user, Batch $batch): bool
    {
        return $this->belongsToUserOrganization($user, $batch->project)
            && ($user->roleIn($batch->project->organization)?->canManageProjects() ?? false);
    }

    private function belongsToUserOrganization(User $user, Project $project): bool
    {
        return $user->organizations()->where('organizations.id', $project->organization_id)->exists();
    }
}
