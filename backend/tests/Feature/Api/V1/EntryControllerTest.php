<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Str;

test('a user can record an entry via the API', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    $response = $this->withHeader('Authorization', 'Bearer '.apiToken($user))->postJson('/api/v1/entries', [
        'project_id' => $project->id,
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => 100_000,
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.amount', 100_000)
        ->assertJsonPath('data.project_id', $project->id);

    $this->assertDatabaseHas('entries', ['project_id' => $project->id, 'amount' => 100_000]);
});

test('posting the same id twice does not create a duplicate entry', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);
    $id = (string) Str::uuid();

    $payload = [
        'id' => $id,
        'project_id' => $project->id,
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => 100_000,
        'occurred_at' => '2026-01-15',
    ];

    $headers = ['Authorization' => 'Bearer '.apiToken($user)];

    $first = $this->withHeaders($headers)->postJson('/api/v1/entries', $payload);
    $first->assertCreated()->assertJsonPath('data.id', $id);

    $second = $this->withHeaders($headers)->postJson('/api/v1/entries', $payload);
    $second->assertOk()->assertJsonPath('data.id', $id);

    expect(Entry::where('id', $id)->count())->toBe(1);
});

test('an entry role can record entries via the API', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Entry)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    $response = $this->withHeader('Authorization', 'Bearer '.apiToken($user))->postJson('/api/v1/entries', [
        'project_id' => $project->id,
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => 50_000,
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertCreated();
});

test('a viewer cannot record entries via the API', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization, Role::Viewer)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    $response = $this->withHeader('Authorization', 'Bearer '.apiToken($user))->postJson('/api/v1/entries', [
        'project_id' => $project->id,
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => 50_000,
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertForbidden();
});

test('a user cannot record entries for a project in another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $project = Project::factory()->create();
    $category = Category::factory()->create(['project_id' => $project->id]);

    $response = $this->withHeader('Authorization', 'Bearer '.apiToken($user))->postJson('/api/v1/entries', [
        'project_id' => $project->id,
        'type' => EntryType::Expense->value,
        'category_id' => $category->id,
        'amount' => 50_000,
        'occurred_at' => '2026-01-15',
    ]);

    $response->assertForbidden();
});
