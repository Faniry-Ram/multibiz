<?php

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Actions\CreateCategory;
use App\Domain\Finance\Actions\DeleteCategory;
use App\Domain\Finance\Actions\UpdateCategory;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Finance\Models\Category;

test('creates a category for a business', function () {
    $business = Business::factory()->create();

    $category = app(CreateCategory::class)->handle(
        $business,
        new CategoryData(name: 'Ventes', kind: TransactionType::Income),
    );

    expect($category->business_id)->toBe($business->id)
        ->and($category->kind)->toBe(TransactionType::Income)
        ->and($category->version)->toBeGreaterThan(0);
});

test('updates a category', function () {
    $category = Category::factory()->create(['name' => 'Old', 'kind' => TransactionType::Income]);

    app(UpdateCategory::class)->handle($category, new CategoryData(name: 'New', kind: TransactionType::Expense));

    expect($category->refresh())
        ->name->toBe('New')
        ->kind->toBe(TransactionType::Expense);
});

test('soft deletes a category', function () {
    $category = Category::factory()->create();

    app(DeleteCategory::class)->handle($category);

    expect($category->trashed())->toBeTrue();
});
