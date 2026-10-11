<?php

namespace App\Domain\Finance\Policies;

use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;

class EntryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Entry $entry): bool
    {
        return $this->belongsToUserOrganization($user, $entry->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $this->belongsToUserOrganization($user, $project)
            && ($user->roleIn($project->organization)?->canRecordEntries() ?? false);
    }

    /**
     * Entries are append-only: never updatable, never deletable, by anyone — see
     * App\Domain\Sync\Concerns\AppendOnly. Corrections go through `reverse` instead.
     */
    public function update(User $user, Entry $entry): bool
    {
        return false;
    }

    public function delete(User $user, Entry $entry): bool
    {
        return false;
    }

    public function reverse(User $user, Entry $entry): bool
    {
        return $this->belongsToUserOrganization($user, $entry->project)
            && ($user->roleIn($entry->project->organization)?->canRecordEntries() ?? false);
    }

    private function belongsToUserOrganization(User $user, Project $project): bool
    {
        return $user->organizations()->where('organizations.id', $project->organization_id)->exists();
    }
}
