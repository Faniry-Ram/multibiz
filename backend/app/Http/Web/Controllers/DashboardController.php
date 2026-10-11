<?php

namespace App\Http\Web\Controllers;

use App\Domain\Analytics\Services\DashboardStats;
use App\Domain\Finance\Models\Entry;
use App\Http\Controllers\Controller;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(DashboardStats $stats): Response
    {
        $organization = auth()->user()->organization();
        $periodStart = Carbon::now()->startOfMonth();
        $periodEnd = Carbon::now()->endOfMonth();

        $projects = $stats->projectTotals($organization, $periodStart, $periodEnd)
            ->map(fn (array $row) => [
                'id' => $row['project']->id,
                'name' => $row['project']->name,
                'color' => $row['project']->color,
                'income_formatted' => (new Money($row['income'], $organization->currency))->format(),
                'expense_formatted' => (new Money($row['expense'], $organization->currency))->format(),
                'balance_formatted' => (new Money($row['balance'], $organization->currency))->format(),
                'balance_is_positive' => $row['balance'] >= 0,
            ])
            ->values();

        $recentEntries = $stats->recentEntries($organization)
            ->map(fn (Entry $entry) => [
                'id' => $entry->id,
                'project_name' => $entry->project->name,
                'category_name' => $entry->category?->name,
                'type' => $entry->type->value,
                'amount_formatted' => $entry->amount !== null ? (new Money($entry->amount, $organization->currency))->format() : null,
                'occurred_at' => $entry->occurred_at->toDateString(),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'period_start' => $periodStart->toDateString(),
            'projects' => $projects,
            'recentEntries' => $recentEntries,
        ]);
    }
}
