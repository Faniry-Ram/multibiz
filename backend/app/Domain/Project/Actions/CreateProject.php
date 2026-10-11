<?php

namespace App\Domain\Project\Actions;

use App\Domain\Finance\Actions\CreateCategory;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

class CreateProject
{
    /**
     * Default categories seeded for every new project, in French.
     *
     * @var list<array{name: string, kind: CategoryKind}>
     */
    private const DEFAULT_CATEGORIES = [
        ['name' => 'Ventes', 'kind' => CategoryKind::Income],
        ['name' => 'Autres revenus', 'kind' => CategoryKind::Income],
        ['name' => 'Aliments / Intrants', 'kind' => CategoryKind::Expense],
        ['name' => 'Soins / Santé', 'kind' => CategoryKind::Expense],
        ['name' => 'Transport', 'kind' => CategoryKind::Expense],
        ['name' => 'Autres dépenses', 'kind' => CategoryKind::Expense],
        ['name' => 'Matériel', 'kind' => CategoryKind::Investment],
    ];

    public function __construct(
        private CreateCategory $createCategory,
    ) {}

    public function handle(Organization $organization, ProjectData $data, ?User $actor = null, ?string $deviceId = null): Project
    {
        $project = Project::create([
            'organization_id' => $organization->id,
            'name' => $data->name,
            'color' => $data->color,
            'model' => $data->model,
            'status' => ProjectStatus::Active,
            'started_on' => $data->started_on ?? Carbon::now(),
            'description' => $data->description,
            'settings' => $data->settings,
            'created_by' => $actor?->id,
            'device_id' => $deviceId,
            'recorded_at' => Carbon::now(),
        ]);

        foreach (self::DEFAULT_CATEGORIES as $category) {
            $this->createCategory->handle(
                $project,
                new CategoryData(name: $category['name'], kind: $category['kind']),
                $actor,
            );
        }

        return $project;
    }
}
