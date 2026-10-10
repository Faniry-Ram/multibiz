<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Models\Category;
use App\Domain\Identity\Models\User;

class CreateCategory
{
    public function handle(Business $business, CategoryData $data, ?User $actor = null): Category
    {
        return Category::create([
            'business_id' => $business->id,
            'name' => $data->name,
            'kind' => $data->kind,
            'color' => $data->color,
            'created_by' => $actor?->id,
        ]);
    }
}
