<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Read-only aggregation for the dashboard. Kept out of Actions since it never mutates
 * state — results are always computed from the `entries` registry, never stored (see
 * docs/audit-architecture.md, rule 3).
 */
class DashboardStats
{
    /**
     * @return Collection<int, array{project: Project, income: int, expense: int, balance: int}>
     */
    public function projectTotals(Organization $organization, Carbon $periodStart, Carbon $periodEnd): Collection
    {
        return $organization->projects()
            ->orderBy('name')
            ->get()
            ->map(function (Project $project) use ($periodStart, $periodEnd) {
                $totals = $project->entries()
                    ->whereBetween('occurred_at', [$periodStart, $periodEnd])
                    ->whereIn('type', [EntryType::Sale->value, EntryType::Expense->value])
                    ->selectRaw('type, SUM(amount) as total')
                    ->groupBy('type')
                    ->pluck('total', 'type');

                $income = (int) ($totals[EntryType::Sale->value] ?? 0);
                $expense = (int) ($totals[EntryType::Expense->value] ?? 0);

                return [
                    'project' => $project,
                    'income' => $income,
                    'expense' => $expense,
                    'balance' => $income - $expense,
                ];
            });
    }

    /**
     * @return Collection<int, Entry>
     */
    public function recentEntries(Organization $organization, int $limit = 10): Collection
    {
        return Entry::query()
            ->whereIn('project_id', $organization->projects()->pluck('id'))
            ->with(['project', 'category'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
