<?php

use App\Domain\Identity\Models\User;

test('the login page renders', function () {
    $response = $this->get(route('login'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('auth/login'));
});

test('a user can log in with correct credentials', function () {
    $user = User::factory()->create(['password' => 'password']);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
});

test('a user cannot log in with the wrong password', function () {
    $user = User::factory()->create(['password' => 'password']);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('a user can log out', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect('/');
    $this->assertGuest();
});
