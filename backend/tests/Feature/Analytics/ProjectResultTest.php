<?php

use App\Domain\Analytics\Services\ProjectResult;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;

test('cumulative result is sales minus expenses, ignoring every other entry type', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 500_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense, 'amount' => 200_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 1_000_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::OwnerIn, 'amount' => 300_000]);

    expect(app(ProjectResult::class)->cumulativeResult($project))->toBe(300_000);
});

test('invested capital sums investment entries only', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 400_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 250_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense, 'amount' => 999_999]);

    expect(app(ProjectResult::class)->investedCapital($project))->toBe(650_000);
});

test('capital recovered is the result over the invested capital, floored at 0%', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 650_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 2_046_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense, 'amount' => 1_570_000]);

    expect(app(ProjectResult::class)->capitalRecoveredPercent($project))->toBeGreaterThan(73.2)
        ->and(app(ProjectResult::class)->capitalRecoveredPercent($project))->toBeLessThan(73.3);
});

test('capital recovered never goes below 0% even when the result is negative', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 500_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense, 'amount' => 100_000]);

    expect(app(ProjectResult::class)->capitalRecoveredPercent($project))->toBe(0.0);
});

test('capital recovered is 0% when nothing was invested, instead of dividing by zero', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 100_000]);

    expect(app(ProjectResult::class)->capitalRecoveredPercent($project))->toBe(0.0);
});
