<?php

use App\Domain\Analytics\Services\BatchStats;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Batch;

test('computes alive, deaths, sold, cost, sales and margin for a batch', function () {
    $batch = Batch::factory()->create(['initial_headcount' => 50]);

    Entry::factory()->create([
        'project_id' => $batch->project_id,
        'organization_id' => $batch->project->organization_id,
        'batch_id' => $batch->id,
        'type' => EntryType::Headcount,
        'headcount_delta' => -9,
        'headcount_reason' => HeadcountReason::Death,
    ]);
    Entry::factory()->create([
        'project_id' => $batch->project_id,
        'organization_id' => $batch->project->organization_id,
        'batch_id' => $batch->id,
        'type' => EntryType::Sale,
        'quantity' => 41,
        'amount' => 41 * 13_000,
    ]);
    Entry::factory()->create([
        'project_id' => $batch->project_id,
        'organization_id' => $batch->project->organization_id,
        'batch_id' => $batch->id,
        'type' => EntryType::Expense,
        'amount' => 360_000,
    ]);

    $stats = app(BatchStats::class)->forBatch($batch);

    expect($stats['alive'])->toBe(0)
        ->and($stats['deaths'])->toBe(9)
        ->and($stats['sold'])->toBe(41)
        ->and($stats['loss_rate'])->toBe(18.0)
        ->and($stats['cost'])->toBe(360_000)
        ->and($stats['sales'])->toBe(533_000)
        ->and($stats['margin'])->toBe(173_000)
        ->and($stats['cost_per_sold'])->toBe(intdiv(360_000, 41));
});

test('a batch with no sales yet has a null cost per sold animal', function () {
    $batch = Batch::factory()->create(['initial_headcount' => 80]);

    Entry::factory()->create([
        'project_id' => $batch->project_id,
        'organization_id' => $batch->project->organization_id,
        'batch_id' => $batch->id,
        'type' => EntryType::Expense,
        'amount' => 370_000,
    ]);

    expect(app(BatchStats::class)->forBatch($batch)['cost_per_sold'])->toBeNull();
});
