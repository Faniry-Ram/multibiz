<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('pocket'));
    $response->assertRedirect(route('login'));
});

test('an owner can access Ma poche', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Owner)->create();

    $response = $this->actingAs($user)->get(route('pocket'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('pocket/index'));
});

test('a user with the entry role cannot access Ma poche', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Entry)->create();

    $response = $this->actingAs($user)->get(route('pocket'));

    $response->assertForbidden();
});

test('a viewer can access Ma poche', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->forOrganization($organization, Role::Viewer)->create();

    $response = $this->actingAs($user)->get(route('pocket'));

    $response->assertOk();
});
