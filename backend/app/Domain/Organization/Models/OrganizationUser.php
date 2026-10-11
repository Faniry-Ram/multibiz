<?php

namespace App\Domain\Organization\Models;

use App\Domain\Organization\Enums\Role;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * The organization_user pivot, as a first-class model so its `role` column is typed
 * instead of accessed as an untyped dynamic property on a generic Pivot.
 *
 * @property int $organization_id
 * @property int $user_id
 * @property Role $role
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class OrganizationUser extends Pivot
{
    protected $table = 'organization_user';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => Role::class,
        ];
    }
}
