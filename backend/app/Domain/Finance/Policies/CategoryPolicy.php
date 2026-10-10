<?php

namespace App\Domain\Finance\Policies;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        return $user->organization_id === $category->business->organization_id;
    }

    public function create(User $user, Business $business): bool
    {
        return $user->organization_id === $business->organization_id;
    }

    public function update(User $user, Category $category): bool
    {
        return $user->organization_id === $category->business->organization_id;
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->organization_id === $category->business->organization_id;
    }
}
