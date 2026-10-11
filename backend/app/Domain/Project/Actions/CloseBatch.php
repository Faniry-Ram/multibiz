<?php

namespace App\Domain\Project\Actions;

use App\Domain\Project\Models\Batch;
use Illuminate\Support\Carbon;

class CloseBatch
{
    public function handle(Batch $batch): Batch
    {
        $batch->update(['closed_on' => Carbon::now()]);

        return $batch;
    }
}
