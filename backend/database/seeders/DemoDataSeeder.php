<?php

namespace Database\Seeders;

use App\Domain\Business\Actions\CreateBusiness;
use App\Domain\Business\Data\BusinessData;
use App\Domain\Finance\Actions\CreateTransaction;
use App\Domain\Finance\Data\TransactionData;
use App\Domain\Finance\Enums\PaymentMethod;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * 1 organization, 1 user, 3 businesses (each seeded with the default categories via
 * CreateBusiness), and ~60 transactions spread over the last 3 months.
 */
class DemoDataSeeder extends Seeder
{
    private const BUSINESSES = [
        ['name' => 'Épicerie Tana', 'type' => 'Épicerie', 'color' => '#16a34a'],
        ['name' => 'Resto Zandry', 'type' => 'Restaurant', 'color' => '#dc2626'],
        ['name' => 'Salon Vita', 'type' => 'Salon de coiffure', 'color' => '#2563eb'],
    ];

    private const TRANSACTIONS_PER_BUSINESS = 20;

    public function run(): void
    {
        $organization = Organization::create(['name' => 'MultiBiz Demo']);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Rina Andria',
            'email' => 'test@example.com',
        ]);

        $createBusiness = app(CreateBusiness::class);
        $createTransaction = app(CreateTransaction::class);

        foreach (self::BUSINESSES as $businessAttributes) {
            $business = $createBusiness->handle(
                $organization,
                new BusinessData(...$businessAttributes),
                $user,
            );

            $categories = $business->categories;

            for ($i = 0; $i < self::TRANSACTIONS_PER_BUSINESS; $i++) {
                $category = $categories->random();
                $isIncome = $category->kind->value === 'income';

                $createTransaction->handle(
                    $business,
                    new TransactionData(
                        category_id: $category->id,
                        type: $category->kind,
                        amount: $isIncome
                            ? fake()->numberBetween(50_000, 2_000_000)
                            : fake()->numberBetween(5_000, 400_000),
                        payment_method: fake()->randomElement(PaymentMethod::cases()),
                        occurred_at: Carbon::instance(fake()->dateTimeBetween('-3 months')),
                        note: fake()->boolean(30) ? fake()->sentence() : null,
                    ),
                    $user,
                );
            }
        }
    }
}
