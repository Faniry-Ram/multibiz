<?php

namespace App\Http\Web\Controllers;

use App\Domain\Analytics\Services\PocketSummary;
use App\Domain\Finance\Models\Entry;
use App\Http\Controllers\Controller;
use App\Support\Money;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PocketController extends Controller
{
    public function index(PocketSummary $service): Response
    {
        $organization = auth()->user()->organization();

        Gate::authorize('accessPocket', $organization);

        $totals = $service->forOrganization($organization);

        $movements = $service->movements($organization)
            ->map(fn (Entry $entry) => [
                'id' => $entry->id,
                'project_name' => $entry->project->name,
                'type' => $entry->type->value,
                'amount_formatted' => (new Money($entry->amount ?? 0, $organization->currency))->format(),
                'occurred_at' => $entry->occurred_at->toDateString(),
                'note' => $entry->note,
            ]);

        return Inertia::render('pocket/index', [
            'out_formatted' => (new Money($totals['out'], $organization->currency))->format(),
            'in_formatted' => (new Money($totals['in'], $organization->currency))->format(),
            'still_committed_formatted' => (new Money($totals['still_committed'], $organization->currency))->format(),
            'available_formatted' => (new Money($totals['available'], $organization->currency))->format(),
            'movements' => $movements,
        ]);
    }
}
