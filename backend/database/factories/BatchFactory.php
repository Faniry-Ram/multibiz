<?php

namespace Database\Factories;

use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Batch>
 */
class BatchFactory extends Factory
{
    protected $model = Batch::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'number' => fake()->unique()->numberBetween(1, 1000),
            'started_on' => fake()->dateTimeBetween('-6 months'),
            'initial_headcount' => fake()->numberBetween(20, 100),
            'recorded_at' => now(),
        ];
    }
}
