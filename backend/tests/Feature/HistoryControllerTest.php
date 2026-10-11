<?php

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('history'));
    $response->assertRedirect(route('login'));
});

test('a user only sees entries from their own organization', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $ownEntry = Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id]);
    $otherEntry = Entry::factory()->create();

    $response = $this->actingAs($user)->get(route('history'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('history/index')
            ->has('entries.data', 1)
            ->where('entries.data.0.id', $ownEntry->id)
        );

    expect($response->getContent())->not->toContain($otherEntry->id);
});

test('entries can be filtered by project', function () {
    $projectA = Project::factory()->create();
    $projectB = Project::factory()->create(['organization_id' => $projectA->organization_id]);
    $user = User::factory()->forOrganization($projectA->organization)->create();

    $entryA = Entry::factory()->create(['project_id' => $projectA->id, 'organization_id' => $projectA->organization_id]);
    Entry::factory()->create(['project_id' => $projectB->id, 'organization_id' => $projectB->organization_id]);

    $response = $this->actingAs($user)->get(route('history', ['project_id' => $projectA->id]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('history/index')
            ->has('entries.data', 1)
            ->where('entries.data.0.id', $entryA->id)
        );
});

test('entries can be filtered by type', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();

    $sale = Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Sale]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'type' => EntryType::Expense]);

    $response = $this->actingAs($user)->get(route('history', ['type' => EntryType::Sale->value]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('history/index')
            ->has('entries.data', 1)
            ->where('entries.data.0.id', $sale->id)
        );
});

test('entries can be filtered by period', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();

    $inRange = Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'occurred_at' => Carbon::parse('2026-01-15')]);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'occurred_at' => Carbon::parse('2026-03-01')]);

    $response = $this->actingAs($user)->get(route('history', ['from' => '2026-01-01', 'to' => '2026-01-31']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('history/index')
            ->has('entries.data', 1)
            ->where('entries.data.0.id', $inRange->id)
        );
});

test('a category comes back with the entry for display', function () {
    $project = Project::factory()->create();
    $user = User::factory()->forOrganization($project->organization)->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense, 'name' => 'Aliments']);
    Entry::factory()->create(['project_id' => $project->id, 'organization_id' => $project->organization_id, 'category_id' => $category->id]);

    $response = $this->actingAs($user)->get(route('history'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->where('entries.data.0.category_name', 'Aliments'));
});
