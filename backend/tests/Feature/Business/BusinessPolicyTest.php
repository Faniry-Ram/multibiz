<?php

use App\Domain\Business\Models\Business;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;

test('a user can view, update and delete a business in their own organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $business = Business::factory()->create(['organization_id' => $organization->id]);

    expect($user->can('view', $business))->toBeTrue()
        ->and($user->can('update', $business))->toBeTrue()
        ->and($user->can('delete', $business))->toBeTrue();
});

test('a user cannot view, update or delete a business from another organization', function () {
    $user = User::factory()->create();
    $otherOrganizationsBusiness = Business::factory()->create();

    expect($user->can('view', $otherOrganizationsBusiness))->toBeFalse()
        ->and($user->can('update', $otherOrganizationsBusiness))->toBeFalse()
        ->and($user->can('delete', $otherOrganizationsBusiness))->toBeFalse();
});
