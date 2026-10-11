<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Models\Category;

class UpdateCategory
{
    public function handle(Category $category, CategoryData $data): Category
    {
        $category->update([
            'name' => $data->name,
            'kind' => $data->kind,
        ]);

        return $category;
    }
}
