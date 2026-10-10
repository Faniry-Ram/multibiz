<?php

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use Illuminate\Support\Facades\DB;

class RegisterOrganizationAndUser
{
    public function handle(string $organizationName, string $name, string $email, string $password): User
    {
        return DB::transaction(function () use ($organizationName, $name, $email, $password) {
            $organization = Organization::create(['name' => $organizationName]);

            return User::create([
                'organization_id' => $organization->id,
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
        });
    }
}
