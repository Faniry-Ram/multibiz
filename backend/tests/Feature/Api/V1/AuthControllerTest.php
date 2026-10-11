<?php

use App\Domain\Identity\Models\User;

test('a user can log in with valid credentials and receives a token', function () {
    $user = User::factory()->forOrganization()->create(['email' => 'rina@example.com', 'password' => 'password']);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'rina@example.com',
        'password' => 'password',
        'device_name' => 'iPhone de Rina',
    ]);

    $response->assertOk()->assertJsonStructure(['token']);
});

test('invalid credentials are rejected', function () {
    $user = User::factory()->forOrganization()->create(['email' => 'rina@example.com']);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'rina@example.com',
        'password' => 'wrong-password',
        'device_name' => 'iPhone de Rina',
    ]);

    $response->assertUnprocessable();
});

test('a token can log out, revoking itself', function () {
    $user = User::factory()->forOrganization()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/v1/logout');

    $response->assertNoContent();
    expect($user->tokens()->count())->toBe(0);
});

test('endpoints require a token', function () {
    $response = $this->getJson('/api/v1/projects');

    $response->assertUnauthorized();
});
