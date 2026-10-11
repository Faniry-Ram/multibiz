<?php

namespace App\Http\Web\Controllers;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The organization-wide, filterable flux history (item 4 of the project mission):
 * every entry across every project, filterable by project/type/period. Grouping by
 * day happens on the frontend from this reverse-chronological, already-sorted list.
 */
class HistoryController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Entry::class);

        $validated = $request->validate([
            'project_id' => ['nullable', 'string', Rule::exists('projects', 'id')],
            'type' => ['nullable', Rule::enum(EntryType::class)],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $organization = $request->user()->organization();

        $entries = Entry::query()
            ->where('organization_id', $organization->id)
            ->when($validated['project_id'] ?? null, fn ($query, $projectId) => $query->where('project_id', $projectId))
            ->when($validated['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($validated['from'] ?? null, fn ($query, $from) => $query->whereDate('occurred_at', '>=', $from))
            ->when($validated['to'] ?? null, fn ($query, $to) => $query->whereDate('occurred_at', '<=', $to))
            ->with(['project', 'category'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (Entry $entry) => [
                'id' => $entry->id,
                'project_id' => $entry->project_id,
                'project_name' => $entry->project->name,
                'category_name' => $entry->category?->name,
                'type' => $entry->type->value,
                'amount_formatted' => $entry->amount !== null ? (new Money($entry->amount, $organization->currency))->format() : null,
                'quantity' => $entry->quantity,
                'unit' => $entry->unit,
                'occurred_at' => $entry->occurred_at->toDateString(),
                'note' => $entry->note,
                'reverses_entry_id' => $entry->reverses_entry_id,
            ]);

        $projects = Project::query()
            ->where('organization_id', $organization->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('history/index', [
            'entries' => $entries,
            'projects' => $projects,
            'filters' => [
                'project_id' => $validated['project_id'] ?? null,
                'type' => $validated['type'] ?? null,
                'from' => $validated['from'] ?? null,
                'to' => $validated['to'] ?? null,
            ],
        ]);
    }
}
