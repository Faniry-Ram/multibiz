<?php

namespace App\Domain\Finance\Data;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use Carbon\Carbon;
use Spatie\LaravelData\Data;

class EntryData extends Data
{
    public function __construct(
        public EntryType $type,
        public Carbon $occurred_at,
        public ?string $batch_id = null,
        public ?string $category_id = null,
        public ?int $amount = null,
        public ?float $quantity = null,
        public ?int $unit_price = null,
        public ?string $unit = null,
        public ?int $headcount_delta = null,
        public ?HeadcountReason $headcount_reason = null,
        public ?int $useful_life_months = null,
        public ?string $note = null,
    ) {}
}
