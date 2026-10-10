<?php

namespace App\Domain\Business\Data;

use Spatie\LaravelData\Data;

class BusinessData extends Data
{
    public function __construct(
        public string $name,
        public ?string $type = null,
        public ?string $color = null,
        public string $currency = 'MGA',
    ) {}
}
