<?php

use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;

test('an owner can view, create and reverse entries of a project in their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();
    $entry = Entry::factory()->create(['organization_id' => $project->organization_id, 'project_id' => $project->id]);

    expect($user->can('view', $entry))->toBeTrue()
        ->and($user->can('create', [Entry::class, $project]))->toBeTrue()
        ->and($user->can('reverse', $entry))->toBeTrue();
});

test('no one can update or delete an entry, even its own organization\'s owner', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();
    $entry = Entry::factory()->create(['organization_id' => $project->organization_id, 'project_id' => $project->id]);

    expect($user->can('update', $entry))->toBeFalse()
        ->and($user->can('delete', $entry))->toBeFalse();
});

test('a user cannot manage entries of a project from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $otherProject = Project::factory()->create();
    $otherEntry = Entry::factory()->create(['organization_id' => $otherProject->organization_id, 'project_id' => $otherProject->id]);

    expect($user->can('view', $otherEntry))->toBeFalse()
        ->and($user->can('create', [Entry::class, $otherProject]))->toBeFalse()
        ->and($user->can('reverse', $otherEntry))->toBeFalse();
});
