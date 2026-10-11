<?php

namespace App\Domain\Organization\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;

class OrganizationPolicy
{
    /**
     * Ma poche and analytics are off-limits to the `entry` role — it can only record
     * flux, not see the money or the figures computed from it.
     */
    public function accessPocket(User $user, Organization $organization): bool
    {
        return $user->roleIn($organization)?->canAccessPocketAndAnalytics() ?? false;
    }
}
