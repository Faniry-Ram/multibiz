<?php

namespace App\Http\Api\Resources\V1;

use App\Domain\Project\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'color' => $this->color,
            'model' => $this->model->value,
            'status' => $this->status->value,
            'started_on' => $this->started_on->toDateString(),
            'description' => $this->description,
            'settings' => $this->settings,
            'version' => $this->version,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
