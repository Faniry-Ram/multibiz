<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Carbon;

/**
 * Corrects a mistaken entry by recording its arithmetic inverse — the original row is
 * never touched (entries are append-only, see App\Domain\Sync\Concerns\AppendOnly).
 */
class ReverseEntry
{
    public function handle(Entry $entry, ?User $actor = null, ?string $deviceId = null, ?string $note = null): Entry
    {
        return Entry::create([
            'organization_id' => $entry->organization_id,
            'project_id' => $entry->project_id,
            'batch_id' => $entry->batch_id,
            'category_id' => $entry->category_id,
            'type' => $entry->type,
            'amount' => $entry->amount !== null ? -$entry->amount : null,
            'quantity' => $entry->quantity !== null ? -$entry->quantity : null,
            'unit_price' => $entry->unit_price,
            'unit' => $entry->unit,
            'headcount_delta' => $entry->headcount_delta !== null ? -$entry->headcount_delta : null,
            'headcount_reason' => $entry->headcount_reason,
            'useful_life_months' => $entry->useful_life_months,
            'occurred_at' => Carbon::now(),
            'recorded_at' => Carbon::now(),
            'note' => $note ?? __('Correction de l\'entrée du :date.', ['date' => $entry->occurred_at->toDateString()]),
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
            'reverses_entry_id' => $entry->id,
        ]);
    }
}
