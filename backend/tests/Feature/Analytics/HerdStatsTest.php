<?php

use App\Domain\Analytics\Services\HerdStats;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('headcount is the sum of headcount entries for the project', function () {
    $project = Project::factory()->create();

    Entry::factory()->create([
        'project_id' => $project->id, 'organization_id' => $project->organization_id,
        'type' => EntryType::Headcount, 'headcount_delta' => 30, 'headcount_reason' => HeadcountReason::Entry,
    ]);
    Entry::factory()->create([
        'project_id' => $project->id, 'organization_id' => $project->organization_id,
        'type' => EntryType::Headcount, 'headcount_delta' => -2, 'headcount_reason' => HeadcountReason::Death,
    ]);

    expect(app(HerdStats::class)->headcount($project))->toBe(28);
});

test('lay rate for a day is that day\'s production over the headcount', function () {
    $project = Project::factory()->create();

    Entry::factory()->create([
        'project_id' => $project->id, 'organization_id' => $project->organization_id,
        'type' => EntryType::Headcount, 'headcount_delta' => 30, 'headcount_reason' => HeadcountReason::Entry,
    ]);
    Entry::factory()->create([
        'project_id' => $project->id, 'organization_id' => $project->organization_id,
        'type' => EntryType::Production, 'quantity' => 19, 'occurred_at' => Carbon::parse('2026-10-10'),
    ]);

    $rate = app(HerdStats::class)->layRateForDate($project, Carbon::parse('2026-10-10'));

    expect(round($rate))->toBe(63.0);
});

test('unsold production is total produced minus total sold', function () {
    $project = Project::factory()->create();

    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Production, 'quantity' => 147]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale, 'quantity' => 88, 'amount' => 44_000]);

    expect(app(HerdStats::class)->unsoldProduction($project))->toBe(59.0);
});
