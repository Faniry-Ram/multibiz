<?php

namespace Database\Factories;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Finance\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->word(),
            'kind' => fake()->randomElement(TransactionType::cases()),
            'color' => fake()->safeHexColor(),
        ];
    }
}
