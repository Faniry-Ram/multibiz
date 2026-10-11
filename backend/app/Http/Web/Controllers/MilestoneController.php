<?php

namespace App\Http\Web\Controllers;

use App\Domain\Project\Actions\CreateMilestone;
use App\Domain\Project\Data\MilestoneData;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreMilestoneRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MilestoneController extends Controller
{
    public function store(StoreMilestoneRequest $request, Project $project, CreateMilestone $action): RedirectResponse
    {
        Gate::authorize('update', $project);

        $data = $request->validated();

        $action->handle($project, new MilestoneData(
            title: $data['title'],
            kind: $data['kind'],
            occurred_on: Carbon::parse($data['occurred_on']),
            description: $data['description'] ?? null,
            batch_id: $data['batch_id'] ?? null,
        ), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Jalon posé.')]);

        return to_route('projects.show', $project);
    }
}
