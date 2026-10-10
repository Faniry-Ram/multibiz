<?php

namespace App\Domain\Finance\Policies;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Models\Transaction;
use App\Domain\Identity\Models\User;

class TransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Transaction $transaction): bool
    {
        return $user->organization_id === $transaction->business->organization_id;
    }

    public function create(User $user, Business $business): bool
    {
        return $user->organization_id === $business->organization_id;
    }

    public function update(User $user, Transaction $transaction): bool
    {
        return $user->organization_id === $transaction->business->organization_id;
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        return $user->organization_id === $transaction->business->organization_id;
    }
}
