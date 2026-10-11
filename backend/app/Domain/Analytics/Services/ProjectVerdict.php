<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\Verdict;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

/**
 * A project is `starting` until it has enough recul (history) to judge: N closed
 * batches for a `lots` project, J90 for everything else — both are project settings
 * with defaults, never hardcoded globally. Past that point it is `profitable`,
 * `watch` or `loss` depending on the cumulative result and, when capital was
 * invested, how much of it has been recovered.
 */
class ProjectVerdict
{
    private const DEFAULT_MIN_BATCHES_CLOSED = 3;

    private const DEFAULT_MIN_DAYS = 90;

    private const DEFAULT_WATCH_MIN_RECOVERY_PERCENT = 50.0;

    public function __construct(
        private ProjectResult $result,
    ) {}

    public function determine(Project $project): Verdict
    {
        if (! $this->hasEnoughHistory($project)) {
            return Verdict::Starting;
        }

        $cumulativeResult = $this->result->cumulativeResult($project);

        if ($cumulativeResult < 0) {
            return Verdict::Loss;
        }

        $invested = $this->result->investedCapital($project);
        $watchThreshold = (float) ($project->settings['thresholds']['watch_min_recovery'] ?? self::DEFAULT_WATCH_MIN_RECOVERY_PERCENT);

        if ($invested <= 0) {
            return $cumulativeResult > 0 ? Verdict::Profitable : Verdict::Watch;
        }

        return $this->result->capitalRecoveredPercent($project) >= $watchThreshold
            ? Verdict::Profitable
            : Verdict::Watch;
    }

    private function hasEnoughHistory(Project $project): bool
    {
        if ($project->model === ProjectModel::Lots) {
            $minBatchesClosed = (int) ($project->settings['thresholds']['min_batches_closed'] ?? self::DEFAULT_MIN_BATCHES_CLOSED);

            return $project->batches()->whereNotNull('closed_on')->count() >= $minBatchesClosed;
        }

        $minDays = (int) ($project->settings['thresholds']['min_days'] ?? self::DEFAULT_MIN_DAYS);

        return $project->started_on->diffInDays(Carbon::now()) >= $minDays;
    }
}
