<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\Category;

class DeleteCategory
{
    public function handle(Category $category): void
    {
        $category->delete();
    }
}
