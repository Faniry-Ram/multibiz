<?php

namespace App\Http\Web\Requests;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Project\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEntryRequest extends FormRequest
{
    /**
     * Fields are validated per entry type — "Noter un flux" adapts its fields to the
     * type the user picks. See docs/audit-architecture.md.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $project = $this->route('project');
        $projectId = $project instanceof Project ? $project->id : null;

        return [
            'type' => ['required', Rule::enum(EntryType::class)],
            'occurred_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],

            'batch_id' => [
                Rule::requiredIf(fn () => $this->input('type') === EntryType::Headcount->value),
                'nullable', 'string',
                Rule::exists('batches', 'id')->where('project_id', $projectId)->whereNull('deleted_at'),
            ],
            'category_id' => [
                Rule::requiredIf(fn () => in_array($this->input('type'), [EntryType::Sale->value, EntryType::Expense->value, EntryType::Investment->value], true)),
                'nullable', 'string',
                Rule::exists('categories', 'id')->where('project_id', $projectId)->whereNull('deleted_at'),
            ],

            'quantity' => [
                Rule::requiredIf(fn () => in_array($this->input('type'), [EntryType::Sale->value, EntryType::Production->value], true)),
                'nullable', 'numeric', 'gt:0',
            ],
            'unit_price' => [
                Rule::requiredIf(fn () => $this->input('type') === EntryType::Sale->value),
                'nullable', 'numeric', 'gt:0',
            ],
            'unit' => ['nullable', 'string', 'max:50'],

            'amount' => [
                Rule::requiredIf(fn () => in_array($this->input('type'), [EntryType::Expense->value, EntryType::Investment->value, EntryType::OwnerIn->value, EntryType::OwnerOut->value], true)),
                'nullable', 'numeric', 'gt:0',
            ],

            'headcount_delta' => [
                Rule::requiredIf(fn () => $this->input('type') === EntryType::Headcount->value),
                'nullable', 'integer',
            ],
            'headcount_reason' => [
                Rule::requiredIf(fn () => $this->input('type') === EntryType::Headcount->value),
                'nullable', Rule::enum(HeadcountReason::class),
            ],

            'useful_life_months' => [
                Rule::requiredIf(fn () => $this->input('type') === EntryType::Investment->value),
                'nullable', 'integer', 'gt:0',
            ],
        ];
    }
}
