<?php

use App\Domain\Identity\Actions\RegisterOrganizationAndUser;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

test('creates an organization and a user that owns it', function () {
    $user = app(RegisterOrganizationAndUser::class)->handle(
        organizationName: 'Ma Société',
        name: 'Rina',
        email: 'rina@example.com',
        password: 'password',
    );

    $organization = Organization::where('name', 'Ma Société')->first();

    expect($organization)->not->toBeNull()
        ->and($user->organization()->id)->toBe($organization->id)
        ->and($user->roleIn($organization))->toBe(Role::Owner)
        ->and($user->email)->toBe('rina@example.com')
        ->and($organization->currency)->toBe('MGA');
});

test('registers with a chosen currency', function () {
    $user = app(RegisterOrganizationAndUser::class)->handle(
        organizationName: 'Ma Société',
        name: 'Rina',
        email: 'rina2@example.com',
        password: 'password',
        currency: 'EUR',
    );

    expect($user->organization()->currency)->toBe('EUR');
});
