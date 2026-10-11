<?php

namespace Database\Factories;

use App\Domain\Project\Models\Milestone;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Milestone>
 */
class MilestoneFactory extends Factory
{
    protected $model = Milestone::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => fake()->sentence(3),
            'kind' => 'note',
            'occurred_on' => fake()->dateTimeBetween('-6 months'),
            'recorded_at' => now(),
        ];
    }
}
