<?php

namespace App\Domain\Project\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $this->belongsToUserOrganization($user, $project);
    }

    public function create(User $user): bool
    {
        return $user->roleIn($user->organization())?->canManageProjects() ?? false;
    }

    public function update(User $user, Project $project): bool
    {
        return $this->belongsToUserOrganization($user, $project)
            && ($user->roleIn($project->organization)?->canManageProjects() ?? false);
    }

    public function archive(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }

    private function belongsToUserOrganization(User $user, Project $project): bool
    {
        return $user->organizations()->where('organizations.id', $project->organization_id)->exists();
    }
}
