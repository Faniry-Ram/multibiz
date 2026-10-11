<?php

namespace Database\Factories;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Entry>
 */
class EntryFactory extends Factory
{
    protected $model = Entry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'project_id' => Project::factory(),
            'category_id' => Category::factory(),
            'type' => fake()->randomElement([EntryType::Sale, EntryType::Expense]),
            'amount' => fake()->numberBetween(1_000, 500_000),
            'occurred_at' => fake()->dateTimeBetween('-3 months'),
            'recorded_at' => now(),
            'note' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
