<?php

namespace App\Domain\Project\Actions;

use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Models\Project;

class UpdateProject
{
    public function handle(Project $project, ProjectData $data): Project
    {
        $project->update([
            'name' => $data->name,
            'color' => $data->color,
            'model' => $data->model,
            'started_on' => $data->started_on ?? $project->started_on,
            'description' => $data->description,
            'settings' => $data->settings,
        ]);

        return $project;
    }
}
