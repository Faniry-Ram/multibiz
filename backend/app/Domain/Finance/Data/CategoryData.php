<?php

namespace App\Domain\Finance\Data;

use App\Domain\Finance\Enums\CategoryKind;
use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        public string $name,
        public CategoryKind $kind,
    ) {}
}
