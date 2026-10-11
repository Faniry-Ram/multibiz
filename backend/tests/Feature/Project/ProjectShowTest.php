<?php

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;

test('guests are redirected to the login page', function () {
    $project = Project::factory()->create();

    $response = $this->get(route('projects.show', $project));
    $response->assertRedirect(route('login'));
});

test('a user can view a project from their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $category = Category::factory()->create(['project_id' => $project->id]);
    $entry = Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $category->id,
        'type' => EntryType::Sale,
    ]);

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('projects/show')
            ->where('project.id', $project->id)
            ->has('categories', 1)
            ->has('entries.data', 1)
            ->where('entries.data.0.id', $entry->id)
        );
});

test('a lots project shows its batches with computed stats', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Lots]);
    $user = User::factory()->forOrganization($project->organization)->create();
    $batch = Batch::factory()->create(['project_id' => $project->id, 'initial_headcount' => 50]);
    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'batch_id' => $batch->id,
        'type' => EntryType::Sale,
        'quantity' => 41,
        'amount' => 41 * 13_000,
    ]);

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('projects/show')
            ->has('batches', 1)
            ->where('batches.0.id', $batch->id)
            ->where('batches.0.sold', 41)
        );
});

test('a user cannot view a project from another organization', function () {
    $user = User::factory()->forOrganization()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->get(route('projects.show', $project));

    $response->assertForbidden();
});
