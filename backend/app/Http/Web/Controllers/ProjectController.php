<?php

namespace App\Http\Web\Controllers;

use App\Domain\Analytics\Services\BatchStats;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Actions\ArchiveProject;
use App\Domain\Project\Actions\CreateProjectFromWizard;
use App\Domain\Project\Actions\UnarchiveProject;
use App\Domain\Project\Actions\UpdateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreProjectRequest;
use App\Http\Web\Requests\UpdateProjectRequest;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Project::class);

        $projects = Project::query()
            ->where('organization_id', auth()->user()->organization()->id)
            ->orderBy('name')
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'model' => $project->model->value,
                'color' => $project->color,
                'status' => $project->status->value,
            ]);

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project, BatchStats $batchStats): Response
    {
        Gate::authorize('view', $project);

        $currency = $project->organization->currency;

        $categories = $project->categories()
            ->whereNull('archived_at')
            ->orderBy('kind')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'kind' => $category->kind->value,
            ]);

        $entries = $project->entries()
            ->with('category')
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Entry $entry) => [
                'id' => $entry->id,
                'category_name' => $entry->category?->name,
                'type' => $entry->type->value,
                'amount_formatted' => $entry->amount !== null ? (new Money($entry->amount, $currency))->format() : null,
                'quantity' => $entry->quantity,
                'unit' => $entry->unit,
                'occurred_at' => $entry->occurred_at->toDateString(),
                'note' => $entry->note,
                'reverses_entry_id' => $entry->reverses_entry_id,
            ]);

        $batches = $project->batches()
            ->orderByDesc('number')
            ->get()
            ->map(function (Batch $batch) use ($batchStats, $currency) {
                $stats = $batchStats->forBatch($batch);

                return [
                    'id' => $batch->id,
                    'number' => $batch->number,
                    'name' => $batch->name,
                    'started_on' => $batch->started_on->toDateString(),
                    'planned_end_on' => $batch->planned_end_on?->toDateString(),
                    'closed_on' => $batch->closed_on?->toDateString(),
                    'initial_headcount' => $batch->initial_headcount,
                    'alive' => $stats['alive'],
                    'deaths' => $stats['deaths'],
                    'sold' => $stats['sold'],
                    'loss_rate' => round($stats['loss_rate']),
                    'cost_formatted' => (new Money($stats['cost'], $currency))->format(),
                    'sales_formatted' => (new Money($stats['sales'], $currency))->format(),
                    'margin_formatted' => (new Money($stats['margin'], $currency))->format(),
                    'cost_per_sold_formatted' => $stats['cost_per_sold'] !== null ? (new Money($stats['cost_per_sold'], $currency))->format() : null,
                ];
            });

        return Inertia::render('projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'model' => $project->model->value,
                'color' => $project->color,
                'status' => $project->status->value,
                'currency' => $currency,
            ],
            'categories' => $categories,
            'entries' => $entries,
            'batches' => $batches,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Project::class);

        $usedColors = Project::query()
            ->where('organization_id', auth()->user()->organization()->id)
            ->whereNotNull('color')
            ->pluck('color');

        return Inertia::render('projects/create', [
            'usedColors' => $usedColors,
        ]);
    }

    public function store(StoreProjectRequest $request, CreateProjectFromWizard $action): RedirectResponse
    {
        Gate::authorize('create', Project::class);

        $data = $request->validated();

        $project = $action->handle(
            $request->user()->organization(),
            new ProjectData(
                name: $data['name'],
                model: ProjectModel::from($data['model']),
                color: $data['color'] ?? null,
                started_on: isset($data['started_on']) ? Carbon::parse($data['started_on']) : null,
                description: $data['description'] ?? null,
            ),
            unit: $data['unit'] ?? null,
            capital: isset($data['capital']) ? (float) $data['capital'] : null,
            note: $data['note'] ?? null,
            actor: $request->user(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Projet créé.')]);

        return to_route('projects.show', $project);
    }

    public function update(UpdateProjectRequest $request, Project $project, UpdateProject $action): RedirectResponse
    {
        Gate::authorize('update', $project);

        $action->handle($project, ProjectData::from($request->validated()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Projet modifié.')]);

        return to_route('projects.show', $project);
    }

    public function archive(Project $project, ArchiveProject $action): RedirectResponse
    {
        Gate::authorize('archive', $project);

        $action->handle($project);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Projet archivé.')]);

        return to_route('projects.index');
    }

    public function unarchive(Project $project, UnarchiveProject $action): RedirectResponse
    {
        Gate::authorize('archive', $project);

        $action->handle($project);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Projet réactivé.')]);

        return to_route('projects.index');
    }
}
