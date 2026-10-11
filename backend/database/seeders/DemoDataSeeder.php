<?php

namespace Database\Seeders;

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * 1 organization, 1 user, 2 projects (poultry + eggs) seeded with a handful of entries
 * each. The exact figures from the project mission (batches, margins, laying rate)
 * land in a dedicated seeder once Analytics (capital récupéré, verdict) is built —
 * see docs/audit-architecture.md, plan step 9.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::create(['name' => 'MultiBiz Demo']);

        $user = User::factory()->create([
            'name' => 'Rina Andria',
            'email' => 'test@example.com',
        ]);

        $organization->users()->attach($user, ['role' => Role::Owner->value]);

        $createProject = app(CreateProject::class);
        $createEntry = app(CreateEntry::class);

        $poultry = $createProject->handle($organization, new ProjectData(
            name: 'Poulets de chair',
            model: ProjectModel::Lots,
            color: '#D97706',
            started_on: Carbon::now()->subMonths(3),
        ), $user);

        $eggs = $createProject->handle($organization, new ProjectData(
            name: 'Œufs',
            model: ProjectModel::Herd,
            color: '#0891B2',
            started_on: Carbon::now()->subMonths(2),
        ), $user);

        $saleCategory = $poultry->categories()->where('name', 'Ventes')->first();
        $expenseCategory = $poultry->categories()->where('name', 'Aliments / Intrants')->first();

        $createEntry->handle($poultry, new EntryData(
            type: EntryType::Sale,
            occurred_at: Carbon::now()->subWeeks(2),
            category_id: $saleCategory->id,
            quantity: 41,
            unit_price: 13_000,
            note: 'Vente bande 1',
        ), $user);

        $createEntry->handle($poultry, new EntryData(
            type: EntryType::Expense,
            occurred_at: Carbon::now()->subMonths(1),
            category_id: $expenseCategory->id,
            amount: 360_000,
        ), $user);

        $eggSaleCategory = $eggs->categories()->where('name', 'Ventes')->first();

        $createEntry->handle($eggs, new EntryData(
            type: EntryType::Sale,
            occurred_at: Carbon::now()->subDays(3),
            category_id: $eggSaleCategory->id,
            quantity: 36,
            unit_price: 500,
            note: 'Vente œufs',
        ), $user);
    }
}
