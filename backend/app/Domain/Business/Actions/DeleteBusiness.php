<?php

namespace App\Domain\Business\Actions;

use App\Domain\Business\Models\Business;

class DeleteBusiness
{
    public function handle(Business $business): void
    {
        $business->delete();
    }
}
