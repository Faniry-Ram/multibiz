<?php

namespace App\Domain\Project\Actions;

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Data\MilestoneData;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Models\Project;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The project creation wizard (docs/maquette/README.md §5 "Nouveau projet") rolls three
 * things into one submit: the project itself, an optional starting capital — noted as
 * an apport in "Ma poche", never as a dépense — and an optional note, which becomes the
 * project's first milestone.
 */
class CreateProjectFromWizard
{
    public function __construct(
        private CreateProject $createProject,
        private CreateEntry $createEntry,
        private CreateMilestone $createMilestone,
    ) {}

    public function handle(
        Organization $organization,
        ProjectData $data,
        ?string $unit = null,
        ?float $capital = null,
        ?string $note = null,
        ?User $actor = null,
    ): Project {
        return DB::transaction(function () use ($organization, $data, $unit, $capital, $note, $actor) {
            $project = $this->createProject->handle(
                $organization,
                new ProjectData(
                    name: $data->name,
                    model: $data->model,
                    color: $data->color,
                    started_on: $data->started_on,
                    description: $data->description,
                    settings: $unit !== null ? ['unit' => $unit] : [],
                ),
                $actor,
            );

            $startedOn = Carbon::parse($project->started_on);

            if ($capital !== null && $capital > 0) {
                $this->createEntry->handle($project, new EntryData(
                    type: EntryType::OwnerIn,
                    occurred_at: $startedOn,
                    amount: Money::fromMajorUnits($capital, $organization->currency)->amount,
                    note: 'Apport de départ',
                ), $actor);
            }

            if ($note !== null && trim($note) !== '') {
                $this->createMilestone->handle($project, new MilestoneData(
                    title: 'Lancement du projet',
                    kind: 'external',
                    occurred_on: $startedOn,
                    description: $note,
                ), $actor);
            }

            return $project;
        });
    }
}
