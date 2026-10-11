<?php

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CreateProjectFromWizard;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use Illuminate\Support\Carbon;

test('creates a project with no capital and no note', function () {
    $organization = Organization::factory()->create();

    $project = app(CreateProjectFromWizard::class)->handle(
        $organization,
        new ProjectData(name: 'Œufs', model: ProjectModel::Herd, started_on: Carbon::parse('2026-08-15')),
    );

    expect($project->name)->toBe('Œufs')
        ->and($project->entries)->toHaveCount(0)
        ->and($project->milestones)->toHaveCount(0);
});

test('notes the starting capital as an apport, not a dépense', function () {
    $organization = Organization::factory()->create(['currency' => 'MGA']);

    $project = app(CreateProjectFromWizard::class)->handle(
        $organization,
        new ProjectData(name: 'Poulets', model: ProjectModel::Lots, started_on: Carbon::parse('2026-03-02')),
        capital: 650000,
    );

    $entry = $project->entries()->sole();

    expect($entry->type)->toBe(EntryType::OwnerIn)
        ->and($entry->amount)->toBe(650000)
        ->and($entry->occurred_at->toDateString())->toBe('2026-03-02')
        ->and($entry->type->affectsResult())->toBeFalse();
});

test('turns the launch note into the project\'s first milestone', function () {
    $organization = Organization::factory()->create();

    $project = app(CreateProjectFromWizard::class)->handle(
        $organization,
        new ProjectData(name: 'Cailles', model: ProjectModel::Lots, started_on: Carbon::parse('2026-10-12')),
        note: "Tester la demande de cailles au marché d'Andravoahangy avant d'investir plus.",
    );

    $milestone = $project->milestones()->sole();

    expect($milestone->description)->toBe("Tester la demande de cailles au marché d'Andravoahangy avant d'investir plus.")
        ->and($milestone->occurred_on->toDateString())->toBe('2026-10-12');
});

test('stores the chosen unit in project settings', function () {
    $organization = Organization::factory()->create();

    $project = app(CreateProjectFromWizard::class)->handle(
        $organization,
        new ProjectData(name: 'Cailles', model: ProjectModel::Lots, started_on: Carbon::parse('2026-10-12')),
        unit: 'Bande',
    );

    expect($project->settings['unit'])->toBe('Bande');
});
