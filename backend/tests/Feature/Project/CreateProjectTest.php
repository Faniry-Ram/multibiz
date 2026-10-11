<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Enums\ProjectStatus;

test('creates an active project owned by the given organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create();

    $project = app(CreateProject::class)->handle(
        $organization,
        new ProjectData(name: 'Poulets de chair', model: ProjectModel::Lots, color: '#D97706'),
        $user,
    );

    expect($project->organization_id)->toBe($organization->id)
        ->and($project->name)->toBe('Poulets de chair')
        ->and($project->model)->toBe(ProjectModel::Lots)
        ->and($project->status)->toBe(ProjectStatus::Active)
        ->and($project->created_by)->toBe($user->id)
        ->and($project->version)->toBeGreaterThan(0);
});

test('seeds the default French categories for a new project', function () {
    $organization = Organization::factory()->create();

    $project = app(CreateProject::class)->handle($organization, new ProjectData(name: 'Œufs', model: ProjectModel::Herd));

    $categories = $project->categories()->get();

    expect($categories->where('kind', CategoryKind::Income)->count())->toBe(2)
        ->and($categories->where('kind', CategoryKind::Expense)->count())->toBe(4)
        ->and($categories->where('kind', CategoryKind::Investment)->count())->toBe(1)
        ->and($categories->pluck('name'))->toContain('Ventes', 'Matériel');
});
