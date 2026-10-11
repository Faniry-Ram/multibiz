<?php

namespace App\Domain\Project\Data;

use Carbon\Carbon;
use Spatie\LaravelData\Data;

class MilestoneData extends Data
{
    public function __construct(
        public string $title,
        public string $kind,
        public Carbon $occurred_on,
        public ?string $description = null,
        public ?string $batch_id = null,
    ) {}
}
