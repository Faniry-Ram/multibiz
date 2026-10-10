<?php

use App\Domain\Business\Models\Business;
use App\Domain\Organization\Models\Organization;

test('a syncable model gets a uuid primary key', function () {
    $business = Business::factory()->create();

    expect($business->id)->toBeString()
        ->and(strlen($business->id))->toBe(36);
});

test('version is populated from the shared sequence and strictly increases across models', function () {
    $organization = Organization::factory()->create();

    $first = Business::factory()->create(['organization_id' => $organization->id]);
    $second = Business::factory()->create(['organization_id' => $organization->id]);

    expect($second->version)->toBeGreaterThan($first->version);

    $first->name = 'Renamed';
    $first->save();

    expect($first->version)->toBeGreaterThan($second->version);
});

test('soft deleting a syncable model keeps the row queryable via withTrashed', function () {
    $business = Business::factory()->create();
    $versionBeforeDelete = $business->version;

    $business->delete();

    expect(Business::find($business->id))->toBeNull()
        ->and(Business::withTrashed()->find($business->id))->not->toBeNull()
        ->and($business->trashed())->toBeTrue()
        ->and($business->version)->toBeGreaterThan($versionBeforeDelete);
});
