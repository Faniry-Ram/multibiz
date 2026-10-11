<?php

use App\Domain\Analytics\Services\HerdStats;
use App\Domain\Analytics\Services\ProjectResult;
use App\Domain\Project\Models\Project;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Support\Carbon;

/**
 * Reproduces the exact figures the project mission gives as "attendu" for its two
 * real projects, so a regression in Entry/Analytics is caught immediately.
 */
test('the broiler project (poulets de chair) matches the expected cumulative result and capital recovered', function () {
    $this->seed(DemoDataSeeder::class);

    $project = Project::where('name', 'Poulets de chair')->firstOrFail();
    $result = app(ProjectResult::class);

    expect($result->cumulativeResult($project))->toBe(476_000)
        ->and(round($result->capitalRecoveredPercent($project)))->toBe(73.0);
});

test('the egg project (œufs) matches the expected unsold eggs, lay rate and result', function () {
    $this->seed(DemoDataSeeder::class);

    $project = Project::where('name', 'Œufs')->firstOrFail();
    $result = app(ProjectResult::class);
    $herd = app(HerdStats::class);

    expect($herd->unsoldProduction($project))->toBe(59.0)
        ->and(round($herd->layRateForDate($project, Carbon::parse('2026-10-10'))))->toBe(63.0)
        ->and($result->cumulativeResult($project))->toBe(-120_000);
});
