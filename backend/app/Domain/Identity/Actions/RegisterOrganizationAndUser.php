<?php

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use Illuminate\Support\Facades\DB;

class RegisterOrganizationAndUser
{
    public function handle(string $organizationName, string $name, string $email, string $password, ?string $currency = null): User
    {
        return DB::transaction(function () use ($organizationName, $name, $email, $password, $currency) {
            $organization = Organization::create([
                'name' => $organizationName,
                'currency' => $currency ?? 'MGA',
            ]);

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);

            $organization->users()->attach($user, ['role' => Role::Owner->value]);

            return $user;
        });
    }
}
