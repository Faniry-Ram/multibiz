<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

test('the registration page renders', function () {
    $response = $this->get(route('register'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('auth/register'));
});

test('registering creates an organization owned by the new user and logs them in', function () {
    $response = $this->post(route('register.store'), [
        'organization_name' => 'Ma Société',
        'name' => 'Rina',
        'email' => 'rina@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = User::where('email', 'rina@example.com')->first();
    $organization = Organization::where('name', 'Ma Société')->first();

    expect($user)->not->toBeNull()
        ->and($organization)->not->toBeNull()
        ->and($user->roleIn($organization))->toBe(Role::Owner);
});

test('registration requires an organization name', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Rina',
        'email' => 'rina@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('organization_name');
    $this->assertGuest();
});
