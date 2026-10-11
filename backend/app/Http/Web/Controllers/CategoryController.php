<?php

namespace App\Http\Web\Controllers;

use App\Domain\Finance\Actions\ArchiveCategory;
use App\Domain\Finance\Actions\CreateCategory;
use App\Domain\Finance\Actions\UpdateCategory;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Models\Category;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Http\Web\Requests\StoreCategoryRequest;
use App\Http\Web\Requests\UpdateCategoryRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function store(StoreCategoryRequest $request, Project $project, CreateCategory $action): RedirectResponse
    {
        Gate::authorize('create', [Category::class, $project]);

        $action->handle($project, CategoryData::from($request->validated()), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Catégorie créée.')]);

        return to_route('projects.show', $project);
    }

    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategory $action): RedirectResponse
    {
        Gate::authorize('update', $category);

        $action->handle($category, CategoryData::from($request->validated()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Catégorie modifiée.')]);

        return to_route('projects.show', $category->project_id);
    }

    public function archive(Category $category, ArchiveCategory $action): RedirectResponse
    {
        Gate::authorize('archive', $category);

        $projectId = $category->project_id;

        $action->handle($category);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Catégorie archivée.')]);

        return to_route('projects.show', $projectId);
    }
}
