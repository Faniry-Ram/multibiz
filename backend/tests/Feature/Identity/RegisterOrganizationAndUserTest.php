<?php

use App\Domain\Identity\Actions\RegisterOrganizationAndUser;
use App\Domain\Organization\Models\Organization;

test('creates an organization and a user that belongs to it', function () {
    $user = app(RegisterOrganizationAndUser::class)->handle(
        organizationName: 'Ma Société',
        name: 'Rina',
        email: 'rina@example.com',
        password: 'password',
    );

    $organization = Organization::where('name', 'Ma Société')->first();

    expect($organization)->not->toBeNull()
        ->and($user->organization_id)->toBe($organization->id)
        ->and($user->email)->toBe('rina@example.com');
});
