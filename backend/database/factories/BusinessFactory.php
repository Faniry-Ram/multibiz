<?php

namespace Database\Factories;

use App\Domain\Business\Models\Business;
use App\Domain\Organization\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    protected $model = Business::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->company(),
            'type' => fake()->randomElement(['Épicerie', 'Restaurant', 'Boutique', 'Salon de coiffure']),
            'color' => fake()->safeHexColor(),
            'currency' => 'MGA',
        ];
    }
}
