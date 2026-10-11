<?php

namespace App\Domain\Organization\Data;

use Spatie\LaravelData\Data;

class OrganizationData extends Data
{
    public function __construct(
        public string $name,
        public string $currency = 'MGA',
        public string $timezone = 'Indian/Antananarivo',
        public int $week_starts_on = 1,
    ) {}
}
