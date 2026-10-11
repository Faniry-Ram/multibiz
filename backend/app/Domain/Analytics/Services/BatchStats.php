<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Project\Models\Batch;

/**
 * Per-batch ("bande") figures for a `lots`-model project — always computed from the
 * `entries` registry, never stored.
 */
class BatchStats
{
    /**
     * @return array{alive: int, deaths: int, sold: int, loss_rate: float, cost: int, sales: int, margin: int, cost_per_sold: int|null}
     */
    public function forBatch(Batch $batch): array
    {
        $sold = (int) $batch->entries()->where('type', EntryType::Sale->value)->sum('quantity');

        $deathAdjustment = (int) $batch->entries()
            ->where('type', EntryType::Headcount->value)
            ->where('headcount_reason', HeadcountReason::Death->value)
            ->sum('headcount_delta');
        $deaths = abs($deathAdjustment);

        $headcountAdjustment = (int) $batch->entries()->where('type', EntryType::Headcount->value)->sum('headcount_delta');
        $alive = max(0, $batch->initial_headcount + $headcountAdjustment - $sold);

        $cost = (int) $batch->entries()->where('type', EntryType::Expense->value)->sum('amount');
        $sales = (int) $batch->entries()->where('type', EntryType::Sale->value)->sum('amount');
        $margin = $sales - $cost;

        return [
            'alive' => $alive,
            'deaths' => $deaths,
            'sold' => $sold,
            'loss_rate' => $batch->initial_headcount > 0 ? $deaths / $batch->initial_headcount * 100 : 0.0,
            'cost' => $cost,
            'sales' => $sales,
            'margin' => $margin,
            'cost_per_sold' => $sold > 0 ? intdiv($cost, $sold) : null,
        ];
    }
}
