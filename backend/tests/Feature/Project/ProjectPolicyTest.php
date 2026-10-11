<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;

test('an owner can view, update and archive a project in their own organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Owner)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);

    expect($user->can('view', $project))->toBeTrue()
        ->and($user->can('update', $project))->toBeTrue()
        ->and($user->can('archive', $project))->toBeTrue();
});

test('a user cannot view, update or archive a project from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $otherOrganizationsProject = Project::factory()->create();

    expect($user->can('view', $otherOrganizationsProject))->toBeFalse()
        ->and($user->can('update', $otherOrganizationsProject))->toBeFalse()
        ->and($user->can('archive', $otherOrganizationsProject))->toBeFalse();
});
