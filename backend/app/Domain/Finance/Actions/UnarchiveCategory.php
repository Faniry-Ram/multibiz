<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\Category;

class UnarchiveCategory
{
    public function handle(Category $category): Category
    {
        $category->update(['archived_at' => null]);

        return $category;
    }
}
