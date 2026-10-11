<?php

namespace App\Http\Api\Resources\V1;

use App\Domain\Finance\Models\Entry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Entry
 */
class EntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'project_id' => $this->project_id,
            'batch_id' => $this->batch_id,
            'category_id' => $this->category_id,
            'type' => $this->type->value,
            'amount' => $this->amount,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'unit' => $this->unit,
            'headcount_delta' => $this->headcount_delta,
            'headcount_reason' => $this->headcount_reason?->value,
            'useful_life_months' => $this->useful_life_months,
            'occurred_at' => $this->occurred_at->toIso8601String(),
            'recorded_at' => $this->recorded_at->toIso8601String(),
            'note' => $this->note,
            'reverses_entry_id' => $this->reverses_entry_id,
            'version' => $this->version,
        ];
    }
}
