<?php

use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;

test('a syncable model gets a uuid primary key', function () {
    $project = Project::factory()->create();

    expect($project->id)->toBeString()
        ->and(strlen($project->id))->toBe(36);
});

test('version is populated from the shared sequence and strictly increases across models', function () {
    $organization = Organization::factory()->create();

    $first = Project::factory()->create(['organization_id' => $organization->id]);
    $second = Project::factory()->create(['organization_id' => $organization->id]);

    expect($second->version)->toBeGreaterThan($first->version);

    $first->name = 'Renamed';
    $first->save();

    expect($first->version)->toBeGreaterThan($second->version);
});

test('soft deleting a syncable model keeps the row queryable via withTrashed', function () {
    $project = Project::factory()->create();
    $versionBeforeDelete = $project->version;

    $project->delete();

    expect(Project::find($project->id))->toBeNull()
        ->and(Project::withTrashed()->find($project->id))->not->toBeNull()
        ->and($project->trashed())->toBeTrue()
        ->and($project->version)->toBeGreaterThan($versionBeforeDelete);
});
