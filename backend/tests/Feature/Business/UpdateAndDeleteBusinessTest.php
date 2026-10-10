<?php

use App\Domain\Business\Actions\DeleteBusiness;
use App\Domain\Business\Actions\UpdateBusiness;
use App\Domain\Business\Data\BusinessData;
use App\Domain\Business\Models\Business;

test('updates a business', function () {
    $business = Business::factory()->create(['name' => 'Old name']);

    app(UpdateBusiness::class)->handle($business, new BusinessData(name: 'New name', currency: 'EUR'));

    expect($business->refresh())
        ->name->toBe('New name')
        ->currency->toBe('EUR');
});

test('soft deletes a business', function () {
    $business = Business::factory()->create();

    app(DeleteBusiness::class)->handle($business);

    expect($business->trashed())->toBeTrue()
        ->and(Business::find($business->id))->toBeNull()
        ->and(Business::withTrashed()->find($business->id))->not->toBeNull();
});
