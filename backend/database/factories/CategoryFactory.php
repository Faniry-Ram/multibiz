<?php

namespace Database\Factories;

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Models\Category;
use App\Domain\Project\Models\Project;
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
            'project_id' => Project::factory(),
            'name' => fake()->word(),
            'kind' => fake()->randomElement(CategoryKind::cases()),
            'recorded_at' => now(),
        ];
    }
}
