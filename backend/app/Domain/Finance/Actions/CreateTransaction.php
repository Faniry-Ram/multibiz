<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Data\TransactionData;
use App\Domain\Finance\Models\Transaction;
use App\Domain\Identity\Models\User;

class CreateTransaction
{
    public function handle(Business $business, TransactionData $data, ?User $actor = null): Transaction
    {
        return Transaction::create([
            'business_id' => $business->id,
            'category_id' => $data->category_id,
            'type' => $data->type,
            'amount' => $data->amount,
            'payment_method' => $data->payment_method,
            'occurred_at' => $data->occurred_at,
            'note' => $data->note,
            'created_by' => $actor?->id,
        ]);
    }
}
