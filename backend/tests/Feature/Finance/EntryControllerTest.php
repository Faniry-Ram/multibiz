<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

test('a user can record a sale entry, computing the amount from quantity and unit price', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Income]);

    $response = $this->actingAs($user)->post(route('entries.store', $project), [
        'type' => EntryType::Sale->value,
        'category_id' => $category->id,
        'quantity' => '41',
        'unit_price' => '13000',
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertRedirect(route('projects.show', $project));
    $this->assertDatabaseHas('entries', [
        'project_id' => $project->id,
        'category_id' => $category->id,
        'amount' => 41 * 13_000,
    ]);
});

test('an entry role can record entries', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Entry)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    $response = $this->actingAs($user)->post(route('entries.store', $project), [
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => '100000',
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertRedirect(route('projects.show', $project));
});

test('a viewer cannot record entries', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Viewer)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    $response = $this->actingAs($user)->post(route('entries.store', $project), [
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => '100000',
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertForbidden();
});

test('a user cannot use a category from a different project', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $otherCategory = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('entries.store', $project), [
        'type' => EntryType::Expense->value,
        'category_id' => $otherCategory->id,
        'amount' => '100',
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertInvalid(['category_id']);
});

test('there is no route to update or delete an entry', function () {
    $entry = Entry::factory()->create();

    expect(function () use ($entry) {
        route('entries.update', $entry);
    })->toThrow(RouteNotFoundException::class);

    expect(function () use ($entry) {
        route('entries.destroy', $entry);
    })->toThrow(RouteNotFoundException::class);
});

test('a user can reverse an entry, recording a correction without touching the original', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $entry = Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'type' => EntryType::Expense,
        'amount' => 50_000,
    ]);

    $response = $this->actingAs($user)->post(route('entries.reverse', $entry));

    $response->assertRedirect(route('projects.show', $project));
    $this->assertDatabaseHas('entries', ['reverses_entry_id' => $entry->id, 'amount' => -50_000]);
    $this->assertDatabaseHas('entries', ['id' => $entry->id, 'amount' => 50_000]);
});

test('a user cannot reverse an entry from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $entry = Entry::factory()->create();

    $response = $this->actingAs($user)->post(route('entries.reverse', $entry));

    $response->assertForbidden();
});
