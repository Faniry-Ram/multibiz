<?php

use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;

test('an append-only model gets a uuid primary key and a version from the shared sequence', function () {
    $project = Project::factory()->create();
    $entry = Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id]);

    expect($entry->id)->toBeString()
        ->and(strlen($entry->id))->toBe(36)
        ->and($entry->version)->toBeGreaterThan($project->version);
});
