<?php

namespace App\Http\Web\Controllers;

use App\Domain\Analytics\Services\DashboardStats;
use App\Domain\Analytics\Services\HerdStats;
use App\Domain\Analytics\Services\ProjectResult;
use App\Domain\Analytics\Services\ProjectTrajectory;
use App\Domain\Analytics\Services\ProjectVerdict;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Project;
use App\Http\Controllers\Controller;
use App\Support\Money;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Static stand-in for "Temps investi" until the mobile app's project timer (see
     * docs/maquette/README.md §3 "chrono en cours") exists and can report real hours.
     * Product decision 2026-10-17: show all 5 banner figures now with a fixed
     * placeholder rather than hiding the 2 time-based ones.
     */
    private const PLACEHOLDER_HOURS_INVESTED = 238;

    public function index(
        Request $request,
        DashboardStats $stats,
        ProjectResult $result,
        ProjectVerdict $verdict,
        ProjectTrajectory $trajectory,
        HerdStats $herdStats,
    ): Response {
        $organization = auth()->user()->organization();
        $requestedPeriod = $request->query('period');
        $period = in_array($requestedPeriod, ['6m', '30d'], true) ? $requestedPeriod : 'all';
        $periodStart = $stats->periodStart($period);
        $now = Carbon::now();

        $projects = $stats->activeProjects($organization);

        $capitalEngaged = 0;
        $allTimeResult = 0;

        $projectCards = $projects->map(function (Project $project) use (
            $result,
            $verdict,
            $trajectory,
            $stats,
            $herdStats,
            $periodStart,
            $now,
            &$capitalEngaged,
            &$allTimeResult,
        ) {
            $invested = $result->investedCapital($project);
            $cumulativeResult = $result->cumulativeResult($project);
            $capitalEngaged += $invested;
            $allTimeResult += $cumulativeResult;

            $projectVerdict = $verdict->determine($project);
            $milestone = $stats->latestMilestone($project);

            return [
                'id' => $project->id,
                'name' => $project->name,
                'color' => $project->color ?? '#64748B',
                'href' => route('projects.show', $project),
                'model_label' => $project->model->label(),
                'since_label' => $this->humanizeSince($project->started_on, $now),
                'verdict_label' => $projectVerdict->label(),
                'verdict_tone' => $projectVerdict->tone(),
                'capital_recovered_percent' => round($result->capitalRecoveredPercent($project)),
                'trajectory' => $trajectory->points($project),
                'result' => $result->resultBetween($project, $periodStart, null),
                'secondary_stat' => $this->secondaryStat($project, $herdStats, $now),
                'last_milestone' => $milestone === null ? null : [
                    'date_label' => $milestone->occurred_on->isoFormat('D MMM'),
                    'text' => $milestone->title,
                ],
            ];
        })->values();

        $capitalRemaining = max(0, $capitalEngaged - $allTimeResult);
        $capitalRecoveredPercent = $capitalEngaged > 0 ? max(0, $allTimeResult / $capitalEngaged * 100) : 0;

        $recentEntries = $stats->recentEntries($organization)
            ->map(fn (Entry $entry) => [
                'id' => $entry->id,
                'project_name' => $entry->project->name,
                'project_color' => $entry->project->color ?? '#64748B',
                'type' => $entry->type->value,
                'label' => $this->entryLabel($entry),
                'amount' => $entry->amount,
                'quantity' => $entry->quantity,
                'headcount_delta' => $entry->headcount_delta,
                'time_label' => $entry->occurred_at->isToday()
                    ? $entry->occurred_at->format('H:i')
                    : ($entry->occurred_at->isYesterday() ? 'hier' : $entry->occurred_at->isoFormat('D MMM')),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'eyebrow' => $this->eyebrow($now, $projects->count()),
            'period' => $period,
            'balance' => [
                'capital_engaged' => $capitalEngaged,
                'projects_count' => $projects->count(),
                'result' => (int) $projectCards->sum('result'),
                'capital_recovered_percent' => round($capitalRecoveredPercent),
                'capital_remaining' => $capitalRemaining,
                'hours_invested' => self::PLACEHOLDER_HOURS_INVESTED,
                'per_hour_formatted' => (new Money(
                    (int) round($allTimeResult / self::PLACEHOLDER_HOURS_INVESTED),
                    $organization->currency,
                ))->format(),
            ],
            'projects' => $projectCards,
            'recentEntries' => $recentEntries,
        ]);
    }

    private function eyebrow(Carbon $now, int $activeProjectsCount): string
    {
        $date = $now->isoFormat('dddd D MMMM');
        $label = $activeProjectsCount === 1 ? 'projet actif' : 'projets actifs';

        return "{$date} · {$activeProjectsCount} {$label}";
    }

    private function humanizeSince(CarbonInterface $startedOn, Carbon $now): string
    {
        $weeks = (int) round($startedOn->diffInWeeks($now));

        if ($weeks < 9) {
            $weeks = max(1, $weeks);

            return 'depuis '.$weeks.' semaine'.($weeks > 1 ? 's' : '');
        }

        $months = (int) round($startedOn->diffInMonths($now));

        return 'depuis '.$months.' mois';
    }

    /**
     * @return array{label: string, value: string}|null
     */
    private function secondaryStat(Project $project, HerdStats $herdStats, Carbon $now): ?array
    {
        if ($project->model === ProjectModel::Lots) {
            $batch = $project->batches()->whereNull('closed_on')->orderByDesc('number')->first();

            if ($batch === null) {
                return null;
            }

            $day = (int) round($batch->started_on->diffInDays($now));
            $planned = $batch->planned_end_on === null
                ? null
                : (int) round($batch->planned_end_on->diffInDays($batch->started_on));

            return [
                'label' => 'Lot en cours',
                'value' => $planned !== null ? "J{$day} / {$planned}" : "J{$day}",
            ];
        }

        if ($project->model === ProjectModel::Herd) {
            $rate = $herdStats->layRateForDate($project, $now);

            return [
                'label' => 'Ponte',
                'value' => round($rate).' %',
            ];
        }

        return null;
    }

    private function entryLabel(Entry $entry): string
    {
        return match ($entry->type) {
            EntryType::Sale => $entry->note ?? 'Vente',
            EntryType::Expense => $entry->note ?? 'Dépense',
            EntryType::Investment => $entry->note ?? 'Investissement',
            EntryType::OwnerIn => 'Apport vers ma poche',
            EntryType::OwnerOut => 'Retrait vers ma poche',
            EntryType::Headcount => $entry->note ?? "Mouvement d'effectif",
            EntryType::Production => $entry->note ?? 'Production du jour',
            EntryType::Note => $entry->note ?? 'Note',
        };
    }
}
