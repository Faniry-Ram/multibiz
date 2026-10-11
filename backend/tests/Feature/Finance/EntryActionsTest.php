<?php

use App\Domain\Finance\Actions\CreateEntry;
use App\Domain\Finance\Actions\ReverseEntry;
use App\Domain\Finance\Data\EntryData;
use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use Illuminate\Support\Carbon;

test('creates an entry for a project', function () {
    $project = Project::factory()->create();
    $category = Category::factory()->create(['project_id' => $project->id, 'kind' => CategoryKind::Expense]);
    $user = User::factory()->create();

    $entry = app(CreateEntry::class)->handle(
        $project,
        new EntryData(
            type: EntryType::Expense,
            occurred_at: Carbon::parse('2026-01-15'),
            category_id: $category->id,
            amount: 150_000,
            note: 'Achat de stock',
        ),
        $user,
    );

    expect($entry->project_id)->toBe($project->id)
        ->and($entry->organization_id)->toBe($project->organization_id)
        ->and($entry->amount)->toBe(150_000)
        ->and($entry->type)->toBe(EntryType::Expense)
        ->and($entry->occurred_at->toDateString())->toBe('2026-01-15')
        ->and($entry->created_by)->toBe($user->id)
        ->and($entry->version)->toBeGreaterThan(0);
});

test('an entry can never be updated', function () {
    $entry = Entry::factory()->create(['amount' => 1_000]);

    expect(fn () => $entry->update(['amount' => 2_000]))->toThrow(RuntimeException::class);
});

test('an entry can never be deleted', function () {
    $entry = Entry::factory()->create();

    expect(fn () => $entry->delete())->toThrow(RuntimeException::class);
    expect(Entry::find($entry->id))->not->toBeNull();
});

test('reversing an entry records a new entry with negated amounts, leaving the original untouched', function () {
    $entry = Entry::factory()->create(['type' => EntryType::Sale, 'amount' => 50_000, 'quantity' => 10]);

    $reversal = app(ReverseEntry::class)->handle($entry);

    expect($reversal->id)->not->toBe($entry->id)
        ->and($reversal->reverses_entry_id)->toBe($entry->id)
        ->and($reversal->amount)->toBe(-50_000)
        ->and((float) $reversal->quantity)->toBe(-10.0)
        ->and($entry->refresh()->amount)->toBe(50_000);
});

test('owner contributions and withdrawals never affect the result', function () {
    expect(EntryType::OwnerIn->affectsResult())->toBeFalse()
        ->and(EntryType::OwnerOut->affectsResult())->toBeFalse()
        ->and(EntryType::Sale->affectsResult())->toBeTrue()
        ->and(EntryType::Expense->affectsResult())->toBeTrue();
});
