<?php

use App\Domain\Project\Actions\ArchiveProject;
use App\Domain\Project\Actions\UnarchiveProject;
use App\Domain\Project\Actions\UpdateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;

test('updates a project', function () {
    $project = Project::factory()->create(['name' => 'Old name']);

    app(UpdateProject::class)->handle($project, new ProjectData(name: 'New name', model: ProjectModel::Simple));

    expect($project->refresh())
        ->name->toBe('New name')
        ->model->toBe(ProjectModel::Simple);
});

test('archives a project without deleting it or its history', function () {
    $project = Project::factory()->create();

    app(ArchiveProject::class)->handle($project);

    expect($project->refresh()->status)->toBe(ProjectStatus::Archived)
        ->and($project->trashed())->toBeFalse();
});

test('unarchives a project', function () {
    $project = Project::factory()->create(['status' => ProjectStatus::Archived]);

    app(UnarchiveProject::class)->handle($project);

    expect($project->refresh()->status)->toBe(ProjectStatus::Active);
});
