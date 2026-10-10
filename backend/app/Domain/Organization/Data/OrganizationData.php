<?php

namespace App\Domain\Organization\Data;

use Spatie\LaravelData\Data;

class OrganizationData extends Data
{
    public function __construct(
        public string $name,
    ) {}
}
