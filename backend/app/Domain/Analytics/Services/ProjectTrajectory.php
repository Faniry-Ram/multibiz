<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

/**
 * Cumulative money position over time for a project's trajectory sparkline — capital
 * investments count as an outflow here (unlike `ProjectResult::cumulativeResult`,
 * which is sales minus expenses only), per docs/maquette/README.md's "argent cumulé,
 * capital compris". Always computed from the `entries` registry, never stored.
 */
class ProjectTrajectory
{
    /**
     * @return list<array{0: int, 1: int}> [day offset since the project started, cumulative Ar]
     */
    public function points(Project $project): array
    {
        $totalsByDay = $project->entries()
            ->whereIn('type', [EntryType::Sale->value, EntryType::Expense->value, EntryType::Investment->value])
            ->selectRaw('DATE(occurred_at) as day, type, SUM(amount) as total')
            ->groupBy('day', 'type')
            ->orderBy('day')
            ->toBase()
            ->get()
            ->groupBy('day');

        if ($totalsByDay->isEmpty()) {
            return [[0, 0], [1, 0]];
        }

        $points = [];
        $running = 0;

        foreach ($totalsByDay as $day => $rows) {
            foreach ($rows as $row) {
                $running += EntryType::from($row->type) === EntryType::Sale
                    ? (int) $row->total
                    : -(int) $row->total;
            }

            $points[] = [(int) $project->started_on->diffInDays(Carbon::parse($day)), $running];
        }

        if (count($points) === 1) {
            $points[] = [$points[0][0] + 1, $points[0][1]];
        }

        return $points;
    }
}
