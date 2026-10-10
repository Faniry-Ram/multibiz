<?php

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Models\Transaction;
use App\Domain\Identity\Models\User;

test('a user can manage transactions of a business in their own organization', function () {
    $user = User::factory()->create();
    $business = Business::factory()->create(['organization_id' => $user->organization_id]);
    $transaction = Transaction::factory()->create(['business_id' => $business->id]);

    expect($user->can('view', $transaction))->toBeTrue()
        ->and($user->can('create', [Transaction::class, $business]))->toBeTrue()
        ->and($user->can('update', $transaction))->toBeTrue()
        ->and($user->can('delete', $transaction))->toBeTrue();
});

test('a user cannot manage transactions of a business from another organization', function () {
    $user = User::factory()->create();
    $otherBusiness = Business::factory()->create();
    $otherTransaction = Transaction::factory()->create(['business_id' => $otherBusiness->id]);

    expect($user->can('view', $otherTransaction))->toBeFalse()
        ->and($user->can('create', [Transaction::class, $otherBusiness]))->toBeFalse()
        ->and($user->can('update', $otherTransaction))->toBeFalse()
        ->and($user->can('delete', $otherTransaction))->toBeFalse();
});
