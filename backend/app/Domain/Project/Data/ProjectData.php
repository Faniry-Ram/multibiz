<?php

namespace App\Domain\Project\Data;

use App\Domain\Project\Enums\ProjectModel;
use Carbon\Carbon;
use Spatie\LaravelData\Data;

class ProjectData extends Data
{
    /**
     * @param  array<string, mixed>  $settings
     */
    public function __construct(
        public string $name,
        public ProjectModel $model,
        public ?string $color = null,
        public ?Carbon $started_on = null,
        public ?string $description = null,
        public array $settings = [],
    ) {}
}
