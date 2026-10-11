<?php

namespace App\Domain\Project\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Data\MilestoneData;
use App\Domain\Project\Models\Milestone;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class CreateMilestone
{
    public function handle(Project $project, MilestoneData $data, ?User $actor = null, ?string $deviceId = null): Milestone
    {
        return Milestone::create([
            'project_id' => $project->id,
            'batch_id' => $data->batch_id,
            'title' => $data->title,
            'kind' => $data->kind,
            'description' => $data->description,
            'occurred_on' => $data->occurred_on,
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
            'recorded_at' => Carbon::now(),
        ]);
    }
}
