<?php

namespace App\Http\Web\Requests;

use App\Domain\Project\Enums\ProjectModel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'model' => ['required', Rule::enum(ProjectModel::class)],
            'color' => ['nullable', 'string', 'max:7'],
            'started_on' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:2000'],
            'unit' => ['nullable', 'string', 'max:50'],
            'capital' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
