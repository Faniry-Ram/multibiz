<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Models\Entry;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Milestone;
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
     * Active projects for the "Vos projets en un coup d'œil" dashboard, per
     * docs/maquette/README.md's `Main` screen — archived projects don't appear there.
     *
     * @return Collection<int, Project>
     */
    public function activeProjects(Organization $organization): Collection
    {
        return $organization->projects()
            ->where('status', ProjectStatus::Active)
            ->orderBy('name')
            ->get();
    }

    /**
     * The start of a dashboard period filter. Null means "Depuis le début" (no lower
     * bound) — the default, and the only option that leaves invested-capital figures
     * meaningful alongside the period-scoped result.
     */
    public function periodStart(string $period): ?Carbon
    {
        return match ($period) {
            '6m' => Carbon::now()->subMonths(6),
            '30d' => Carbon::now()->subDays(30),
            default => null,
        };
    }

    public function latestMilestone(Project $project): ?Milestone
    {
        return $project->milestones()->latest('occurred_on')->first();
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
