<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Project\Models\Project;

/**
 * Result, invested capital and capital-recovered ratio — always computed from the
 * `entries` registry, never stored (rule 3 of docs/audit-architecture.md).
 */
class ProjectResult
{
    /**
     * Résultat cumulé = ventes − dépenses courantes, all-time.
     */
    public function cumulativeResult(Project $project): int
    {
        $totals = $project->entries()
            ->whereIn('type', [EntryType::Sale->value, EntryType::Expense->value])
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $sales = (int) ($totals[EntryType::Sale->value] ?? 0);
        $expenses = (int) ($totals[EntryType::Expense->value] ?? 0);

        return $sales - $expenses;
    }

    /**
     * Capital investi = somme des investissements.
     */
    public function investedCapital(Project $project): int
    {
        return (int) $project->entries()->where('type', EntryType::Investment->value)->sum('amount');
    }

    /**
     * Capital récupéré = résultat cumulé ÷ capital investi, floored at 0%. A project
     * with no recorded investment has nothing to recover, so this returns 0.0 rather
     * than dividing by zero.
     */
    public function capitalRecoveredPercent(Project $project): float
    {
        $invested = $this->investedCapital($project);

        if ($invested <= 0) {
            return 0.0;
        }

        return max(0.0, $this->cumulativeResult($project) / $invested * 100);
    }
}
