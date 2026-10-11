<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Entry;
use App\Domain\Organization\Models\Organization;
use Illuminate\Support\Collection;

/**
 * "Ma poche": the owner's personal money across every project of an organization —
 * always computed from the `entries` registry, never stored.
 */
class PocketSummary
{
    /**
     * @return array{out: int, in: int, still_committed: int, available: int}
     */
    public function forOrganization(Organization $organization): array
    {
        $totals = Entry::query()
            ->where('organization_id', $organization->id)
            ->whereIn('type', [
                EntryType::OwnerIn->value,
                EntryType::OwnerOut->value,
                EntryType::Sale->value,
                EntryType::Expense->value,
                EntryType::Investment->value,
            ])
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $out = (int) ($totals[EntryType::OwnerIn->value] ?? 0);
        $in = (int) ($totals[EntryType::OwnerOut->value] ?? 0);
        $sales = (int) ($totals[EntryType::Sale->value] ?? 0);
        $expenses = (int) ($totals[EntryType::Expense->value] ?? 0);
        $investments = (int) ($totals[EntryType::Investment->value] ?? 0);

        return [
            'out' => $out,
            'in' => $in,
            'still_committed' => $out - $in,
            'available' => $out + $sales - $expenses - $investments - $in,
        ];
    }

    /**
     * @return Collection<int, Entry>
     */
    public function movements(Organization $organization, int $limit = 50): Collection
    {
        return Entry::query()
            ->where('organization_id', $organization->id)
            ->whereIn('type', [EntryType::OwnerIn->value, EntryType::OwnerOut->value])
            ->with('project')
            ->orderByDesc('occurred_at')
            ->limit($limit)
            ->get();
    }
}
