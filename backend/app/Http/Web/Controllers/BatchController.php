<?php

namespace App\Http\Web\Controllers;

use App\Domain\Project\Actions\CloseBatch;
use App\Domain\Project\Actions\OpenBatch;
use App\Domain\Project\Data\BatchData;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreBatchRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class BatchController extends Controller
{
    public function store(StoreBatchRequest $request, Project $project, OpenBatch $action): RedirectResponse
    {
        Gate::authorize('create', [Batch::class, $project]);

        $action->handle($project, BatchData::from($request->validated()), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bande ouverte.')]);

        return to_route('projects.show', $project);
    }

    public function close(Batch $batch, CloseBatch $action): RedirectResponse
    {
        Gate::authorize('close', $batch);

        $action->handle($batch);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bande clôturée.')]);

        return to_route('projects.show', $batch->project_id);
    }
}
