<?php

use App\Domain\Analytics\Services\PocketSummary;
use App\Domain\Analytics\Services\ProjectResult;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;

test('computes the four pocket figures across every project of an organization', function () {
    $project = Project::factory()->create();
    $organization = $project->organization;

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $organization->id, 'type' => EntryType::OwnerIn, 'amount' => 500_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $organization->id, 'type' => EntryType::OwnerOut, 'amount' => 100_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $organization->id, 'type' => EntryType::Sale, 'amount' => 200_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $organization->id, 'type' => EntryType::Expense, 'amount' => 50_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $organization->id, 'type' => EntryType::Investment, 'amount' => 80_000]);

    $totals = app(PocketSummary::class)->forOrganization($organization);

    expect($totals['out'])->toBe(500_000)
        ->and($totals['in'])->toBe(100_000)
        ->and($totals['still_committed'])->toBe(400_000)
        ->and($totals['available'])->toBe(500_000 + 200_000 - 50_000 - 80_000 - 100_000);
});

test('a contribution or withdrawal never changes the project result', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 100_000]);

    $resultBefore = app(ProjectResult::class)->cumulativeResult($project);

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::OwnerIn, 'amount' => 900_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::OwnerOut, 'amount' => 300_000]);

    $resultAfter = app(ProjectResult::class)->cumulativeResult($project);

    expect($resultAfter)->toBe($resultBefore);
});

test('an organization with no owner movements yet has every pocket figure at zero', function () {
    $organization = Organization::factory()->create();

    expect(app(PocketSummary::class)->forOrganization($organization))->toBe([
        'out' => 0,
        'in' => 0,
        'still_committed' => 0,
        'available' => 0,
    ]);
});
