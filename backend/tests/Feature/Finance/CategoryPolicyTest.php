<?php

use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;

test('an owner can manage categories of a project in their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();
    $category = Category::factory()->create(['project_id' => $project->id]);

    expect($user->can('view', $category))->toBeTrue()
        ->and($user->can('create', [Category::class, $project]))->toBeTrue()
        ->and($user->can('update', $category))->toBeTrue()
        ->and($user->can('archive', $category))->toBeTrue();
});

test('a user cannot manage categories of a project from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $otherProject = Project::factory()->create();
    $otherCategory = Category::factory()->create(['project_id' => $otherProject->id]);

    expect($user->can('view', $otherCategory))->toBeFalse()
        ->and($user->can('create', [Category::class, $otherProject]))->toBeFalse()
        ->and($user->can('update', $otherCategory))->toBeFalse()
        ->and($user->can('archive', $otherCategory))->toBeFalse();
});
