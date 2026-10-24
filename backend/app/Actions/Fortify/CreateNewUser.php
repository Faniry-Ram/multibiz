<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Domain\Identity\Actions\RegisterOrganizationAndUser;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(
        private RegisterOrganizationAndUser $registerOrganizationAndUser,
    ) {}

    /**
     * Validate and create a newly registered user, along with the organization they own.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'organization_name' => ['required', 'string', 'max:255'],
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return $this->registerOrganizationAndUser->handle(
            organizationName: $input['organization_name'],
            name: $input['name'],
            email: $input['email'],
            password: $input['password'],
        );
    }
}
