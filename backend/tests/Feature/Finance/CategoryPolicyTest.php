<?php

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;

test('a user can manage categories of a business in their own organization', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create(['organization_id' => $user->organization_id]);
    $category = Category::factory()->create(['business_id' => $business->id]);

    expect($user->can('view', $category))->toBeTrue()
        ->and($user->can('create', [Category::class, $business]))->toBeTrue()
        ->and($user->can('update', $category))->toBeTrue()
        ->and($user->can('delete', $category))->toBeTrue();
});

test('a user cannot manage categories of a business from another organization', function () {
    $user = User::factory()->create();
    $otherBusiness = Business::factory()->create();
    $otherCategory = Category::factory()->create(['business_id' => $otherBusiness->id]);

    expect($user->can('view', $otherCategory))->toBeFalse()
        ->and($user->can('create', [Category::class, $otherBusiness]))->toBeFalse()
        ->and($user->can('update', $otherCategory))->toBeFalse()
        ->and($user->can('delete', $otherCategory))->toBeFalse();
});
