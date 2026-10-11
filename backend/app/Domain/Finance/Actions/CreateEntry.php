<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class CreateEntry
{
    /**
     * $id lets a client (the mobile sync API) generate the entry's UUID itself and
     * replay the same request safely: posting the same id twice returns the entry
     * created the first time instead of creating a duplicate — see rule 4 of
     * docs/audit-architecture.md ("écriture idempotente").
     */
    public function handle(Project $project, EntryData $data, ?User $actor = null, ?string $deviceId = null, ?string $id = null): Entry
    {
        if ($id !== null) {
            $existing = Entry::find($id);

            if ($existing !== null) {
                return $existing;
            }
        }

        $entry = new Entry([
            'organization_id' => $project->organization_id,
            'project_id' => $project->id,
            'batch_id' => $data->batch_id,
            'category_id' => $data->category_id,
            'type' => $data->type,
            'amount' => $this->resolveAmount($data),
            'quantity' => $data->quantity,
            'unit_price' => $data->unit_price,
            'unit' => $data->unit,
            'headcount_delta' => $data->headcount_delta,
            'headcount_reason' => $data->headcount_reason,
            'useful_life_months' => $data->useful_life_months,
            'occurred_at' => $data->occurred_at,
            'recorded_at' => Carbon::now(),
            'note' => $data->note,
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
        ]);

        if ($id !== null) {
            $entry->id = $id;
        }

        $entry->save();

        return $entry;
    }

    /**
     * A sale's amount is always quantity × unit price — callers never compute it
     * themselves, so the rule can't drift between the web controller, the seeder, and
     * the future sync API.
     */
    private function resolveAmount(EntryData $data): ?int
    {
        if ($data->type === EntryType::Sale && $data->quantity !== null && $data->unit_price !== null) {
            return (int) round($data->quantity * $data->unit_price);
        }

        return $data->amount;
    }
}
