<?php

namespace App\Domain\Business\Actions;

use App\Domain\Business\Data\BusinessData;
use App\Domain\Business\Models\Business;
use App\Domain\Finance\Actions\CreateCategory;
use App\Domain\Finance\Data\CategoryData;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;

class CreateBusiness
{
    /**
     * Default categories seeded for every new business, in French.
     *
     * @var list<array{name: string, kind: TransactionType}>
     */
    private const DEFAULT_CATEGORIES = [
        ['name' => 'Ventes', 'kind' => TransactionType::Income],
        ['name' => 'Prestations de services', 'kind' => TransactionType::Income],
        ['name' => 'Autres revenus', 'kind' => TransactionType::Income],
        ['name' => 'Achats / Stock', 'kind' => TransactionType::Expense],
        ['name' => 'Loyer', 'kind' => TransactionType::Expense],
        ['name' => 'Salaires', 'kind' => TransactionType::Expense],
        ['name' => 'Transport', 'kind' => TransactionType::Expense],
        ['name' => 'Marketing', 'kind' => TransactionType::Expense],
        ['name' => 'Charges (eau, électricité)', 'kind' => TransactionType::Expense],
        ['name' => 'Fournitures', 'kind' => TransactionType::Expense],
        ['name' => 'Autres dépenses', 'kind' => TransactionType::Expense],
    ];

    public function __construct(
        private CreateCategory $createCategory,
    ) {}

    public function handle(Organization $organization, BusinessData $data, ?User $actor = null): Business
    {
        $business = Business::create([
            'organization_id' => $organization->id,
            'name' => $data->name,
            'type' => $data->type,
            'color' => $data->color,
            'currency' => $data->currency,
            'created_by' => $actor?->id,
        ]);

        foreach (self::DEFAULT_CATEGORIES as $category) {
            $this->createCategory->handle(
                $business,
                new CategoryData(name: $category['name'], kind: $category['kind']),
                $actor,
            );
        }

        return $business;
    }
}
