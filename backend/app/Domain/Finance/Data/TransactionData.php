<?php

namespace App\Domain\Finance\Data;

use App\Domain\Finance\Enums\PaymentMethod;
use App\Domain\Finance\Enums\TransactionType;
use Carbon\Carbon;
use Spatie\LaravelData\Data;

class TransactionData extends Data
{
    public function __construct(
        public string $category_id,
        public TransactionType $type,
        public int $amount,
        public PaymentMethod $payment_method,
        public Carbon $occurred_at,
        public ?string $note = null,
    ) {}
}
