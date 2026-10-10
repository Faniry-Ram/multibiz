<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\Transaction;

class DeleteTransaction
{
    public function handle(Transaction $transaction): void
    {
        $transaction->delete();
    }
}
