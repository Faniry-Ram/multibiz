<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Data\TransactionData;
use App\Domain\Finance\Models\Transaction;

class UpdateTransaction
{
    public function handle(Transaction $transaction, TransactionData $data): Transaction
    {
        $transaction->update([
            'category_id' => $data->category_id,
            'type' => $data->type,
            'amount' => $data->amount,
            'payment_method' => $data->payment_method,
            'occurred_at' => $data->occurred_at,
            'note' => $data->note,
        ]);

        return $transaction;
    }
}
