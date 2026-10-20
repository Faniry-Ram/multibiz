<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->forOrganization()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));
    $response->assertOk();
});

test('the dashboard reports each active project\'s all-time result by default', function () {
    $organization = Organization::factory()->create(['currency' => 'MGA']);
    $project = Project::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->forOrganization($organization)->create();
    $income = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Income]);
    $expense = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $income->id,
        'type' => EntryType::Sale,
        'amount' => 500_000,
        'occurred_at' => Carbon::now()->startOfMonth()->addDays(2),
    ]);
    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $expense->id,
        'type' => EntryType::Expense,
        'amount' => 200_000,
        'occurred_at' => Carbon::now()->startOfMonth()->addDays(3),
    ]);
    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $expense->id,
        'type' => EntryType::Expense,
        'amount' => 999_999,
        'occurred_at' => Carbon::now()->subMonths(2),
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')
            ->where('period', 'all')
            ->has('projects', 1)
            ->where('projects.0.id', $project->id)
            ->where('projects.0.result', 500_000 - 200_000 - 999_999)
            ->where('balance.result', 500_000 - 200_000 - 999_999)
            ->has('recentEntries', 3)
        );
});

test('the dashboard\'s period selector scopes each project\'s result but not the entry list', function () {
    $organization = Organization::factory()->create(['currency' => 'MGA']);
    $project = Project::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->forOrganization($organization)->create();
    $income = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Income]);
    $expense = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);

    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $income->id,
        'type' => EntryType::Sale,
        'amount' => 500_000,
        'occurred_at' => Carbon::now()->subDays(2),
    ]);
    Entry::factory()->create([
        'organization_id' => $project->organization_id,
        'project_id' => $project->id,
        'category_id' => $expense->id,
        'type' => EntryType::Expense,
        'amount' => 999_999,
        'occurred_at' => Carbon::now()->subMonths(2),
    ]);

    $response = $this->actingAs($user)->get(route('dashboard', ['period' => '30d']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')
            ->where('period', '30d')
            ->where('projects.0.result', 500_000)
            ->has('recentEntries', 2)
        );
});

test('the dashboard only shows the user\'s own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    Project::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')->has('projects', 1));
});
