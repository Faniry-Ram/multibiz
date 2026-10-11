<?php

namespace App\Http\Web\Controllers;

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Actions\ReverseEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreEntryRequest;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class EntryController extends Controller
{
    public function store(StoreEntryRequest $request, Project $project, CreateEntry $action): RedirectResponse
    {
        Gate::authorize('create', [Entry::class, $project]);

        $data = $request->validated();
        $type = EntryType::from($data['type']);
        $currency = $project->organization->currency;

        $quantity = isset($data['quantity']) ? (float) $data['quantity'] : null;
        $unitPrice = isset($data['unit_price']) ? Money::fromMajorUnits((float) $data['unit_price'], $currency)->amount : null;
        $amount = isset($data['amount']) ? Money::fromMajorUnits((float) $data['amount'], $currency)->amount : null;

        $action->handle($project, new EntryData(
            type: $type,
            occurred_at: Carbon::parse($data['occurred_at']),
            batch_id: $data['batch_id'] ?? null,
            category_id: $data['category_id'] ?? null,
            amount: $amount,
            quantity: $quantity,
            unit_price: $unitPrice,
            unit: $data['unit'] ?? null,
            headcount_delta: $data['headcount_delta'] ?? null,
            headcount_reason: isset($data['headcount_reason']) ? HeadcountReason::from($data['headcount_reason']) : null,
            useful_life_months: $data['useful_life_months'] ?? null,
            note: $data['note'] ?? null,
        ), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Flux enregistré.')]);

        return to_route('projects.show', $project);
    }

    public function reverse(Entry $entry, ReverseEntry $action): RedirectResponse
    {
        Gate::authorize('reverse', $entry);

        $action->handle($entry, auth()->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Flux inverse enregistré.')]);

        return to_route('projects.show', $entry->project_id);
    }
}
