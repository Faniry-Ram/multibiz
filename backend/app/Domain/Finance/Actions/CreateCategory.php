<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class CreateCategory
{
    public function handle(Project $project, CategoryData $data, ?User $actor = null, ?string $deviceId = null): Category
    {
        return Category::create([
            'project_id' => $project->id,
            'name' => $data->name,
            'kind' => $data->kind,
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
            'recorded_at' => Carbon::now(),
        ]);
    }
}
