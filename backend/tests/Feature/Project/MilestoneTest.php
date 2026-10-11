<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CreateMilestone;
use App\Domain\Project\Data\MilestoneData;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('creates a milestone for a project', function () {
    $project = Project::factory()->create();

    $milestone = app(CreateMilestone::class)->handle($project, new MilestoneData(
        title: 'Vaccin Newcastle ajouté',
        kind: 'method',
        occurred_on: Carbon::parse('2026-04-18'),
        description: 'Ajout d\'un vaccin dès J7.',
    ));

    expect($milestone->project_id)->toBe($project->id)
        ->and($milestone->title)->toBe('Vaccin Newcastle ajouté')
        ->and($milestone->kind)->toBe('method')
        ->and($milestone->occurred_on->toDateString())->toBe('2026-04-18');
});

test('a manager can post a milestone for a project in their own organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Manager)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);

    $response = $this->actingAs($user)->post(route('milestones.store', $project), [
        'title' => 'Troisième abreuvoir contre la chaleur',
        'kind' => 'external',
        'occurred_on' => '2026-10-10',
    ]);

    $response->assertRedirect(route('projects.show', $project));
    $this->assertDatabaseHas('milestones', [
        'project_id' => $project->id,
        'title' => 'Troisième abreuvoir contre la chaleur',
    ]);
});

test('a user from another organization cannot post a milestone', function () {
    $project = Project::factory()->create();
    $otherUser = User::factory()->forOrganization(Organization::factory()->create(), Role::Manager)->create();

    $response = $this->actingAs($otherUser)->post(route('milestones.store', $project), [
        'title' => 'Intrusion',
        'kind' => 'external',
        'occurred_on' => '2026-10-10',
    ]);

    $response->assertForbidden();
});

test('an entry role cannot post a milestone', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();
    $project = Project::factory()->create(['organization_id' => $organization->id]);

    $response = $this->actingAs($user)->post(route('milestones.store', $project), [
        'title' => 'Intrusion',
        'kind' => 'external',
        'occurred_on' => '2026-10-10',
    ]);

    $response->assertForbidden();
});
