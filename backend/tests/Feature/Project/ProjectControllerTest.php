<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Project;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('projects.index'));
    $response->assertRedirect(route('login'));
});

test('a user sees only their organization\'s projects', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization)->create();
    $ownProject = Project::factory()->create(['organization_id' => $organization->id]);
    $otherProject = Project::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('projects/index')
            ->has('projects', 1)
            ->where('projects.0.id', $ownProject->id)
        );

    expect($response->getContent())->not->toContain($otherProject->id);
});

test('an owner can create a project for their organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Owner)->create();

    $response = $this->actingAs($user)->post(route('projects.store'), [
        'name' => 'Poulets de chair',
        'model' => ProjectModel::Lots->value,
        'color' => '#D97706',
    ]);

    $response->assertRedirect(route('projects.index'));

    $this->assertDatabaseHas('projects', [
        'organization_id' => $organization->id,
        'name' => 'Poulets de chair',
        'created_by' => $user->id,
    ]);
});

test('an entry role cannot create a project', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();

    $response = $this->actingAs($user)->post(route('projects.store'), [
        'name' => 'Poulets de chair',
        'model' => ProjectModel::Lots->value,
    ]);

    $response->assertForbidden();
});

test('a project name is required', function () {
    $user = User::factory()->forOrganization()->create();

    $response = $this->actingAs($user)->post(route('projects.store'), [
        'model' => ProjectModel::Simple->value,
    ]);

    $response->assertInvalid(['name']);
});

test('an owner can archive a project in their own organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Owner)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);

    $response = $this->actingAs($user)->post(route('projects.archive', $project));

    $response->assertRedirect(route('projects.index'));
    expect($project->refresh()->status->value)->toBe('archived');
});

test('a user cannot archive a project from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->post(route('projects.archive', $project));

    $response->assertForbidden();
});
