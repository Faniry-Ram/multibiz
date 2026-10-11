<?php

namespace App\Domain\Finance\Policies;

use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        return $this->belongsToUserOrganization($user, $category->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $this->belongsToUserOrganization($user, $project)
            && ($user->roleIn($project->organization)?->canManageProjects() ?? false);
    }

    public function update(User $user, Category $category): bool
    {
        return $this->belongsToUserOrganization($user, $category->project)
            && ($user->roleIn($category->project->organization)?->canManageProjects() ?? false);
    }

    public function archive(User $user, Category $category): bool
    {
        return $this->update($user, $category);
    }

    private function belongsToUserOrganization(User $user, Project $project): bool
    {
        return $user->organizations()->where('organizations.id', $project->organization_id)->exists();
    }
}
