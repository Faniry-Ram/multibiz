<?php

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Actions\CreateTransaction;
use App\Domain\Finance\Actions\DeleteTransaction;
use App\Domain\Finance\Actions\UpdateTransaction;
use App\Domain\Finance\Data\TransactionData;
use App\Domain\Finance\Enums\PaymentMethod;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Transaction;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Carbon;

test('creates a transaction for a business', function () {
    $business = Business::factory()->create();
    $category = Category::factory()->create(['business_id' => $business->id, 'kind' => TransactionType::Expense]);
    $user = User::factory()->create(['organization_id' => $business->organization_id]);

    $transaction = app(CreateTransaction::class)->handle(
        $business,
        new TransactionData(
            category_id: $category->id,
            type: TransactionType::Expense,
            amount: 150_000,
            payment_method: PaymentMethod::MobileMoney,
            occurred_at: Carbon::parse('2026-01-15'),
            note: 'Achat de stock',
        ),
        $user,
    );

    expect($transaction->business_id)->toBe($business->id)
        ->and($transaction->amount)->toBe(150_000)
        ->and($transaction->type)->toBe(TransactionType::Expense)
        ->and($transaction->payment_method)->toBe(PaymentMethod::MobileMoney)
        ->and($transaction->occurred_at->toDateString())->toBe('2026-01-15')
        ->and($transaction->created_by)->toBe($user->id)
        ->and($transaction->version)->toBeGreaterThan(0);
});

test('updates a transaction', function () {
    $transaction = Transaction::factory()->create(['amount' => 1_000, 'type' => TransactionType::Income]);
    $newCategory = Category::factory()->create(['business_id' => $transaction->business_id, 'kind' => TransactionType::Expense]);

    app(UpdateTransaction::class)->handle($transaction, new TransactionData(
        category_id: $newCategory->id,
        type: TransactionType::Expense,
        amount: 2_000,
        payment_method: PaymentMethod::Cash,
        occurred_at: Carbon::parse('2026-02-01'),
    ));

    expect($transaction->refresh())
        ->category_id->toBe($newCategory->id)
        ->amount->toBe(2_000)
        ->type->toBe(TransactionType::Expense);
});

test('soft deletes a transaction', function () {
    $transaction = Transaction::factory()->create();

    app(DeleteTransaction::class)->handle($transaction);

    expect($transaction->trashed())->toBeTrue();
});
