<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CloseBatch;
use App\Domain\Project\Actions\OpenBatch;
use App\Domain\Project\Data\BatchData;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;

test('opens a batch with an auto-incrementing number per project', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Lots]);

    $first = app(OpenBatch::class)->handle($project, new BatchData(initial_headcount: 50));
    $second = app(OpenBatch::class)->handle($project, new BatchData(initial_headcount: 60));

    expect($first->number)->toBe(1)
        ->and($second->number)->toBe(2)
        ->and($second->initial_headcount)->toBe(60)
        ->and($second->closed_on)->toBeNull();
});

test('closes a batch', function () {
    $batch = Batch::factory()->create();

    app(CloseBatch::class)->handle($batch);

    expect($batch->refresh()->closed_on)->not->toBeNull();
});

test('a manager can open a batch for a project in their own organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Manager)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id, 'model' => ProjectModel::Lots]);

    $response = $this->actingAs($user)->post(route('batches.store', $project), [
        'initial_headcount' => 50,
    ]);

    $response->assertRedirect(route('projects.show', $project));
    $this->assertDatabaseHas('batches', ['project_id' => $project->id, 'initial_headcount' => 50]);
});

test('an entry role cannot open a batch', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id, 'model' => ProjectModel::Lots]);

    $response = $this->actingAs($user)->post(route('batches.store', $project), [
        'initial_headcount' => 50,
    ]);

    $response->assertForbidden();
});
