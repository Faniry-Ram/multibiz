<?php

namespace App\Domain\Finance\Data;

use App\Domain\Finance\Enums\TransactionType;
use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        public string $name,
        public TransactionType $kind,
        public ?string $color = null,
    ) {}
}
