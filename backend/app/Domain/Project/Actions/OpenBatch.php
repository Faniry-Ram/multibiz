<?php

namespace App\Domain\Project\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Data\BatchData;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class OpenBatch
{
    public function handle(Project $project, BatchData $data, ?User $actor = null, ?string $deviceId = null): Batch
    {
        $number = $project->batches()->max('number') + 1;

        return Batch::create([
            'project_id' => $project->id,
            'number' => $number,
            'name' => $data->name,
            'started_on' => $data->started_on ?? Carbon::now(),
            'planned_end_on' => $data->planned_end_on,
            'initial_headcount' => $data->initial_headcount,
            'notes' => $data->notes,
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
            'recorded_at' => Carbon::now(),
        ]);
    }
}
