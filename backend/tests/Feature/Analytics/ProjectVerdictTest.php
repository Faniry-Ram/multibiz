<?php

use App\Domain\Analytics\Enums\Verdict;
use App\Domain\Analytics\Services\ProjectVerdict;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('a lots project is starting until enough batches have closed', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Lots]);
    Batch::factory()->count(2)->create(['project_id' => $project->id, 'closed_on' => Carbon::now()]);

    expect(app(ProjectVerdict::class)->determine($project))->toBe(Verdict::Starting);
});

test('a non-lots project is starting until J90 has passed', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Herd, 'started_on' => Carbon::now()->subDays(30)]);

    expect(app(ProjectVerdict::class)->determine($project))->toBe(Verdict::Starting);
});

test('a project past its starting phase with a negative result is a loss', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Herd, 'started_on' => Carbon::now()->subDays(100)]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense, 'amount' => 100_000]);

    expect(app(ProjectVerdict::class)->determine($project))->toBe(Verdict::Loss);
});

test('a project that recovered enough of its capital is profitable', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Herd, 'started_on' => Carbon::now()->subDays(100)]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 100_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 200_000]);

    expect(app(ProjectVerdict::class)->determine($project))->toBe(Verdict::Profitable);
});

test('a project with a small positive result relative to its capital is watched', function () {
    $project = Project::factory()->create(['model' => ProjectModel::Herd, 'started_on' => Carbon::now()->subDays(100)]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Investment, 'amount' => 1_000_000]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'amount' => 10_000]);

    expect(app(ProjectVerdict::class)->determine($project))->toBe(Verdict::Watch);
});

test('thresholds are configurable per project via settings', function () {
    $project = Project::factory()->create([
        'model' => ProjectModel::Herd,
        'started_on' => Carbon::now()->subDays(30),
        'settings' => ['thresholds' => ['min_days' => 10]],
    ]);

    expect(app(ProjectVerdict::class)->determine($project))->not->toBe(Verdict::Starting);
});
