<?php

use App\Domain\Finance\Actions\ArchiveCategory;
use App\Domain\Finance\Actions\CreateCategory;
use App\Domain\Finance\Actions\UnarchiveCategory;
use App\Domain\Finance\Actions\UpdateCategory;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Models\Category;
use App\Domain\Project\Models\Project;

test('creates a category for a project', function () {
    $project = Project::factory()->create();

    $category = app(CreateCategory::class)->handle(
        $project,
        new CategoryData(name: 'Ventes', kind: CategoryKind::Income),
    );

    expect($category->project_id)->toBe($project->id)
        ->and($category->kind)->toBe(CategoryKind::Income)
        ->and($category->version)->toBeGreaterThan(0);
});

test('updates a category', function () {
    $category = Category::factory()->create(['name' => 'Old', 'kind' => CategoryKind::Income]);

    app(UpdateCategory::class)->handle($category, new CategoryData(name: 'New', kind: CategoryKind::Expense));

    expect($category->refresh())
        ->name->toBe('New')
        ->kind->toBe(CategoryKind::Expense);
});

test('archives and unarchives a category without deleting it', function () {
    $category = Category::factory()->create();

    app(ArchiveCategory::class)->handle($category);
    expect($category->refresh()->archived_at)->not->toBeNull()
        ->and($category->trashed())->toBeFalse();

    app(UnarchiveCategory::class)->handle($category);
    expect($category->refresh()->archived_at)->toBeNull();
});
