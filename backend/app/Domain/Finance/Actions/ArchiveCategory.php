<?php

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\Category;
use Illuminate\Support\Carbon;

/**
 * Categories are never deleted (entries reference them forever) — they are archived
 * instead, which hides them from new-entry pickers without touching history.
 */
class ArchiveCategory
{
    public function handle(Category $category): Category
    {
        $category->update(['archived_at' => Carbon::now()]);

        return $category;
    }
}
