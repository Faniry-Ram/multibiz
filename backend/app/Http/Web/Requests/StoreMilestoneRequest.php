<?php

namespace App\Http\Web\Requests;

use App\Domain\Project\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMilestoneRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $project = $this->route('project');
        $projectId = $project instanceof Project ? $project->id : null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'kind' => ['required', Rule::in(['supplier', 'price', 'method', 'external'])],
            'occurred_on' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
            'batch_id' => [
                'nullable', 'string',
                Rule::exists('batches', 'id')->where('project_id', $projectId)->whereNull('deleted_at'),
            ],
        ];
    }
}
