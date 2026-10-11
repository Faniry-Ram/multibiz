<?php

namespace Database\Seeders;

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CloseBatch;
use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Actions\OpenBatch;
use App\Domain\Project\Data\BatchData;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Reproduces the two real projects from the project mission, so the dashboard and
 * analytics always have realistic figures to show — and so EntryCalculationsTest can
 * assert the numbers the mission itself gives as "attendu".
 */
class DemoDataSeeder extends Seeder
{
    private CreateProject $createProject;

    private OpenBatch $openBatch;

    private CloseBatch $closeBatch;

    private CreateEntry $createEntry;

    private User $user;

    public function run(): void
    {
        $this->createProject = app(CreateProject::class);
        $this->openBatch = app(OpenBatch::class);
        $this->closeBatch = app(CloseBatch::class);
        $this->createEntry = app(CreateEntry::class);

        $organization = Organization::create(['name' => 'MultiBiz Demo']);

        $this->user = User::factory()->create([
            'name' => 'Rina Andria',
            'email' => 'test@example.com',
        ]);
        $organization->users()->attach($this->user, ['role' => Role::Owner->value]);

        $this->seedBroilers($organization);
        $this->seedEggs($organization);
    }

    private function seedBroilers(Organization $organization): void
    {
        $project = $this->createProject->handle($organization, new ProjectData(
            name: 'Poulets de chair',
            model: ProjectModel::Lots,
            color: '#D97706',
            started_on: Carbon::parse('2026-04-01'),
        ), $this->user);

        $equipment = $project->categories()->where('name', 'Matériel')->first();
        $this->record($project, EntryType::Investment, Carbon::parse('2026-04-01'), [
            'category_id' => $equipment->id,
            'amount' => 650_000,
            'useful_life_months' => 36,
            'note' => 'Poulailler et matériel',
        ]);

        $this->broilerBatch($project, number: 1, initialHeadcount: 50, deaths: 9, sold: 41, unitPrice: 13_000, cost: 360_000, startedOn: '2026-04-05', closed: true);
        $this->broilerBatch($project, number: 2, initialHeadcount: 60, deaths: 6, sold: 54, unitPrice: 13_500, cost: 430_000, startedOn: '2026-06-01', closed: true);
        $this->broilerBatch($project, number: 3, initialHeadcount: 60, deaths: 4, sold: 56, unitPrice: 14_000, cost: 410_000, startedOn: '2026-08-01', closed: true);
        $this->broilerBatch($project, number: 4, initialHeadcount: 80, deaths: 3, sold: 0, unitPrice: 0, cost: 370_000, startedOn: '2026-09-25', closed: false);
    }

    private function broilerBatch(
        Project $project,
        int $number,
        int $initialHeadcount,
        int $deaths,
        int $sold,
        int $unitPrice,
        int $cost,
        string $startedOn,
        bool $closed,
    ): void {
        $sales = $project->categories()->where('name', 'Ventes')->first();
        $feed = $project->categories()->where('name', 'Aliments / Intrants')->first();

        $batch = $this->openBatch->handle($project, new BatchData(
            initial_headcount: $initialHeadcount,
            started_on: Carbon::parse($startedOn),
        ), $this->user);

        $this->record($project, EntryType::Headcount, Carbon::parse($startedOn)->addWeeks(5), [
            'batch_id' => $batch->id,
            'headcount_delta' => -$deaths,
            'headcount_reason' => HeadcountReason::Death,
        ]);

        $this->record($project, EntryType::Expense, Carbon::parse($startedOn)->addWeeks(5), [
            'batch_id' => $batch->id,
            'category_id' => $feed->id,
            'amount' => $cost,
            'note' => "Aliments bande {$number}",
        ]);

        if ($sold > 0) {
            $this->record($project, EntryType::Sale, Carbon::parse($startedOn)->addWeeks(6), [
                'batch_id' => $batch->id,
                'category_id' => $sales->id,
                'quantity' => $sold,
                'unit_price' => $unitPrice,
                'note' => "Vente bande {$number}",
            ]);
        }

        if ($closed) {
            $this->closeBatch->handle($batch->fresh());
        }
    }

    private function seedEggs(Organization $organization): void
    {
        $project = $this->createProject->handle($organization, new ProjectData(
            name: 'Œufs',
            model: ProjectModel::Herd,
            color: '#0891B2',
            started_on: Carbon::parse('2026-07-01'),
        ), $this->user);

        $equipment = $project->categories()->where('name', 'Matériel')->first();
        $sales = $project->categories()->where('name', 'Ventes')->first();
        $feed = $project->categories()->where('name', 'Aliments / Intrants')->first();

        $this->record($project, EntryType::Investment, Carbon::parse('2026-07-01'), [
            'category_id' => $equipment->id,
            'amount' => 700_000,
            'useful_life_months' => 24,
            'note' => 'Poulailler et pondoirs',
        ]);

        $this->record($project, EntryType::Headcount, Carbon::parse('2026-07-01'), [
            'headcount_delta' => 30,
            'headcount_reason' => HeadcountReason::Entry,
            'note' => 'Mise en place du troupeau',
        ]);

        $this->record($project, EntryType::Expense, Carbon::parse('2026-07-01'), [
            'category_id' => $feed->id,
            'amount' => 164_000,
            'note' => 'Aliments et soins depuis le début',
        ]);

        $produced = [3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19];
        $sold = [0, 0, 0, 6, 0, 12, 0, 6, 10, 0, 12, 6, 36];
        $firstDay = Carbon::parse('2026-09-28');

        foreach ($produced as $i => $quantity) {
            $day = $firstDay->copy()->addDays($i);

            $this->record($project, EntryType::Production, $day, [
                'quantity' => $quantity,
                'unit' => 'œufs',
            ]);

            if ($sold[$i] > 0) {
                $this->record($project, EntryType::Sale, $day, [
                    'category_id' => $sales->id,
                    'quantity' => $sold[$i],
                    'unit_price' => 500,
                ]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function record(Project $project, EntryType $type, Carbon $occurredAt, array $overrides): void
    {
        $this->createEntry->handle($project, new EntryData(
            type: $type,
            occurred_at: $occurredAt,
            batch_id: $overrides['batch_id'] ?? null,
            category_id: $overrides['category_id'] ?? null,
            amount: $overrides['amount'] ?? null,
            quantity: $overrides['quantity'] ?? null,
            unit_price: $overrides['unit_price'] ?? null,
            unit: $overrides['unit'] ?? null,
            headcount_delta: $overrides['headcount_delta'] ?? null,
            headcount_reason: $overrides['headcount_reason'] ?? null,
            useful_life_months: $overrides['useful_life_months'] ?? null,
            note: $overrides['note'] ?? null,
        ), $this->user);
    }
}
