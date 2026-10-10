<?php

namespace Database\Factories;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Enums\PaymentMethod;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(TransactionType::cases());

        return [
            'business_id' => Business::factory(),
            'category_id' => Category::factory(),
            'type' => $type,
            'amount' => fake()->numberBetween(1_000, 500_000),
            'payment_method' => fake()->randomElement(PaymentMethod::cases()),
            'occurred_at' => fake()->dateTimeBetween('-3 months'),
            'note' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
