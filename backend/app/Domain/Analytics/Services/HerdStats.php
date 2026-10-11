<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

/**
 * Figures for a `herd`-model project (continuous flock, daily production) — always
 * computed from the `entries` registry, never stored.
 */
class HerdStats
{
    /**
     * Effectif = somme des mouvements d'effectif du projet (pas de bande).
     */
    public function headcount(Project $project): int
    {
        return (int) $project->entries()->where('type', EntryType::Headcount->value)->sum('headcount_delta');
    }

    /**
     * Taux de ponte (du jour) = production de ce jour ÷ effectif.
     */
    public function layRateForDate(Project $project, Carbon $date): float
    {
        $headcount = $this->headcount($project);

        if ($headcount <= 0) {
            return 0.0;
        }

        $production = (float) $project->entries()
            ->where('type', EntryType::Production->value)
            ->whereDate('occurred_at', $date)
            ->sum('quantity');

        return $production / $headcount * 100;
    }

    /**
     * Production pas encore vendue = produit − vendu, all-time.
     */
    public function unsoldProduction(Project $project): float
    {
        $produced = (float) $project->entries()->where('type', EntryType::Production->value)->sum('quantity');
        $sold = (float) $project->entries()->where('type', EntryType::Sale->value)->sum('quantity');

        return $produced - $sold;
    }
}
