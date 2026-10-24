<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

test('owner, manager, and viewer can access the pocket', function (Role $role) {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, $role)->create();

    expect($user->can('accessPocket', $organization))->toBeTrue();
})->with([Role::Owner, Role::Manager, Role::Viewer]);

test('the entry role cannot access the pocket', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();

    expect($user->can('accessPocket', $organization))->toBeFalse();
});

test('a user with no membership in the organization cannot access its pocket', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create();

    expect($user->can('accessPocket', $organization))->toBeFalse()
        ->and($user->roleIn($organization))->toBeNull();
});
