<?php

namespace Database\Factories;

use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->company(),
            'color' => fake()->safeHexColor(),
            'model' => fake()->randomElement(ProjectModel::cases()),
            'status' => ProjectStatus::Active,
            'started_on' => fake()->dateTimeBetween('-6 months'),
            'settings' => [],
            'recorded_at' => now(),
        ];
    }
}
