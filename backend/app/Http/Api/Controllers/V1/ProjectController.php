<?php

namespace App\Http\Api\Controllers\V1;

use App\Domain\Project\Models\Project;
use App\Http\Api\Resources\V1\ProjectResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Project::class);

        $projects = Project::query()
            ->where('organization_id', $request->user()->organization()->id)
            ->orderBy('name')
            ->get();

        return ProjectResource::collection($projects);
    }
}
