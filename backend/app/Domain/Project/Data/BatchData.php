<?php

namespace App\Domain\Project\Data;

use Carbon\Carbon;
use Spatie\LaravelData\Data;

class BatchData extends Data
{
    public function __construct(
        public int $initial_headcount,
        public ?string $name = null,
        public ?Carbon $started_on = null,
        public ?Carbon $planned_end_on = null,
        public ?string $notes = null,
    ) {}
}
