<?php

use App\Domain\Business\Actions\CreateBusiness;
use App\Domain\Business\Data\BusinessData;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;

test('creates a business owned by the given organization', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);

    $business = app(CreateBusiness::class)->handle(
        $organization,
        new BusinessData(name: 'Épicerie Tana', type: 'Épicerie', color: '#16a34a'),
        $user,
    );

    expect($business->organization_id)->toBe($organization->id)
        ->and($business->name)->toBe('Épicerie Tana')
        ->and($business->currency)->toBe('MGA')
        ->and($business->created_by)->toBe($user->id)
        ->and($business->version)->toBeGreaterThan(0);
});

test('seeds the default French categories for a new business', function () {
    $organization = Organization::factory()->create();

    $business = app(CreateBusiness::class)->handle($organization, new BusinessData(name: 'Boutique'));

    $categories = $business->categories()->get();

    expect($categories)->toHaveCount(11)
        ->and($categories->where('kind', TransactionType::Income)->count())->toBe(3)
        ->and($categories->where('kind', TransactionType::Expense)->count())->toBe(8)
        ->and($categories->pluck('name'))->toContain('Ventes', 'Loyer', 'Autres dépenses');
});
