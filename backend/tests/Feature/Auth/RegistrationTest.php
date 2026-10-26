<?php

use App\Domain\Identity\Models\User;

test('the registration page renders', function () {
    $response = $this->get(route('register'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('auth/register'));
});

test('registering creates a user and logs them in', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Rina',
        'email' => 'rina@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = User::where('email', 'rina@example.com')->first();

    expect($user)->not->toBeNull();
});
