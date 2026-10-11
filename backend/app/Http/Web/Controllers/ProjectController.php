<?php

namespace App\Http\Web\Controllers;

use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Actions\ArchiveProject;
use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Actions\UnarchiveProject;
use App\Domain\Project\Actions\UpdateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreProjectRequest;
use App\Http\Web\Requests\UpdateProjectRequest;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
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

    public function show(Project $project): Response
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
        ]);
    }

    public function store(StoreProjectRequest $request, CreateProject $action): RedirectResponse
    {
        Gate::authorize('create', Project::class);

        $action->handle(
            $request->user()->organization(),
            ProjectData::from($request->validated()),
            $request->user(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Projet créé.')]);

        return to_route('projects.index');
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
