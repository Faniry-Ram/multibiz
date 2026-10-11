<?php

namespace App\Http\Api\Requests\V1;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEntryRequest extends FormRequest
{
    /**
     * Mirrors the web StoreEntryRequest's per-type rules — see
     * docs/audit-architecture.md. `id` lets the mobile client generate the entry's
     * UUID itself for idempotent replay (rule 4: "écriture idempotente").
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $projectId = $this->input('project_id');

        return [
            'id' => ['nullable', 'uuid'],
            'project_id' => [
                'required', 'string',
                Rule::exists('projects', 'id')->whereNull('deleted_at'),
            ],
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
                'nullable', 'integer', 'gt:0',
            ],
            'unit' => ['nullable', 'string', 'max:50'],

            'amount' => [
                Rule::requiredIf(fn () => in_array($this->input('type'), [EntryType::Expense->value, EntryType::Investment->value, EntryType::OwnerIn->value, EntryType::OwnerOut->value], true)),
                'nullable', 'integer', 'gt:0',
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
