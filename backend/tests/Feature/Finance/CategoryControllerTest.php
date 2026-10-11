<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;

test('an owner can create a category for a project in their organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();

    $response = $this->actingAs($user)->post(route('categories.store', $project), [
        'name' => 'Ventes',
        'kind' => CategoryKind::Income->value,
    ]);

    $response->assertRedirect(route('projects.show', $project));
    $this->assertDatabaseHas('categories', [
        'project_id' => $project->id,
        'name' => 'Ventes',
        'kind' => CategoryKind::Income->value,
    ]);
});

test('an entry role cannot create a category', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Entry)->create();

    $response = $this->actingAs($user)->post(route('categories.store', $project), [
        'name' => 'Ventes',
        'kind' => CategoryKind::Income->value,
    ]);

    $response->assertForbidden();
});

test('a user cannot create a category for a project in another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->post(route('categories.store', $project), [
        'name' => 'Ventes',
        'kind' => CategoryKind::Income->value,
    ]);

    $response->assertForbidden();
});

test('an owner can update a category in their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'name' => 'Old']);

    $response = $this->actingAs($user)->patch(route('categories.update', $category), [
        'name' => 'New',
        'kind' => CategoryKind::Expense->value,
    ]);

    $response->assertRedirect(route('projects.show', $project));
    expect($category->refresh())->name->toBe('New')->kind->toBe(CategoryKind::Expense);
});

test('a user cannot update a category from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->patch(route('categories.update', $category), [
        'name' => 'Hijacked',
        'kind' => CategoryKind::Expense->value,
    ]);

    $response->assertForbidden();
});

test('an owner can archive a category in their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Owner)->create();
    $category = Category::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($user)->post(route('categories.archive', $category));

    $response->assertRedirect(route('projects.show', $project));
    expect($category->refresh()->archived_at)->not->toBeNull();
});

test('a user cannot archive a category from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('categories.archive', $category));

    $response->assertForbidden();
    $this->assertDatabaseHas('categories', ['id' => $category->id, 'archived_at' => null]);
});
