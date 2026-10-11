<?php

namespace Database\Factories;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Attach the user to a (new, unless given) organization with the given role.
     */
    public function forOrganization(?Organization $organization = null, Role $role = Role::Owner): static
    {
        return $this->afterCreating(function (User $user) use ($organization, $role) {
            $organization ??= Organization::factory()->create();

            $organization->users()->attach($user, ['role' => $role->value]);
        });
    }
}
