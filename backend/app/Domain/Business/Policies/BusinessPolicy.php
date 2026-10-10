<?php

namespace App\Domain\Business\Policies;

use App\Domain\Business\Models\Business;
use App\Domain\Identity\Models\User;

class BusinessPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Business $business): bool
    {
        return $user->organization_id === $business->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Business $business): bool
    {
        return $user->organization_id === $business->organization_id;
    }

    public function delete(User $user, Business $business): bool
    {
        return $user->organization_id === $business->organization_id;
    }
}
