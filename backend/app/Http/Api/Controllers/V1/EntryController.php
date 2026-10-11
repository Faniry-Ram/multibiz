<?php

namespace App\Http\Api\Controllers\V1;

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;
use App\Http\Api\Requests\V1\StoreEntryRequest;
use App\Http\Api\Resources\V1\EntryResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

class EntryController extends Controller
{
    public function store(StoreEntryRequest $request, CreateEntry $action): JsonResponse
    {
        $data = $request->validated();
        $project = Project::findOrFail((string) $data['project_id']);

        Gate::authorize('create', [Entry::class, $project]);

        $entry = $action->handle($project, new EntryData(
            type: EntryType::from($data['type']),
            occurred_at: Carbon::parse($data['occurred_at']),
            batch_id: $data['batch_id'] ?? null,
            category_id: $data['category_id'] ?? null,
            amount: $data['amount'] ?? null,
            quantity: $data['quantity'] ?? null,
            unit_price: $data['unit_price'] ?? null,
            unit: $data['unit'] ?? null,
            headcount_delta: $data['headcount_delta'] ?? null,
            headcount_reason: isset($data['headcount_reason']) ? HeadcountReason::from($data['headcount_reason']) : null,
            useful_life_months: $data['useful_life_months'] ?? null,
            note: $data['note'] ?? null,
        ), $request->user(), id: $data['id'] ?? null);

        return (new EntryResource($entry))
            ->response()
            ->setStatusCode($entry->wasRecentlyCreated ? 201 : 200);
    }
}
