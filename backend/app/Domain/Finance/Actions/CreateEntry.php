<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class CreateEntry
{
    public function handle(Project $project, EntryData $data, ?User $actor = null, ?string $deviceId = null): Entry
    {
        return Entry::create([
            'organization_id' => $project->organization_id,
            'project_id' => $project->id,
            'batch_id' => $data->batch_id,
            'category_id' => $data->category_id,
            'type' => $data->type,
            'amount' => $data->amount,
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
    }
}
