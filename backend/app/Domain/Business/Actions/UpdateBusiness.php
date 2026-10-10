<?php

namespace App\Domain\Business\Actions;

use App\Domain\Business\Data\BusinessData;
use App\Domain\Business\Models\Business;

class UpdateBusiness
{
    public function handle(Business $business, BusinessData $data): Business
    {
        $business->update([
            'name' => $data->name,
            'type' => $data->type,
            'color' => $data->color,
            'currency' => $data->currency,
        ]);

        return $business;
    }
}
