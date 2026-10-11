<?php

use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;

test('an entry role can record entries but not manage projects or categories', function () {
    $organization = Organization::factory()->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();

    expect($user->can('create', [Entry::class, $project]))->toBeTrue()
        ->and($user->can('create', Project::class))->toBeFalse()
        ->and($user->can('update', $project))->toBeFalse();
});

test('a viewer cannot record entries nor manage projects', function () {
    $organization = Organization::factory()->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->forOrganization($organization, Role::Viewer)->create();

    expect($user->can('create', [Entry::class, $project]))->toBeFalse()
        ->and($user->can('create', Project::class))->toBeFalse();
});

test('owner and manager roles can manage projects and categories', function () {
    $organization = Organization::factory()->create();

    $owner = User::factory()->forOrganization($organization, Role::Owner)->create();
    $manager = User::factory()->forOrganization($organization, Role::Manager)->create();

    expect($owner->can('create', Project::class))->toBeTrue()
        ->and($manager->can('create', Project::class))->toBeTrue();
});

test('pocket and analytics access is denied to the entry role only', function () {
    expect(Role::Owner->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Manager->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Viewer->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Entry->canAccessPocketAndAnalytics())->toBeFalse();
});
