<?php

use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;

test('a user only sees their own organization\'s projects', function () {
    $user = User::factory()->forOrganization()->create();
    $ownProject = Project::factory()->create(['organization_id' => $user->organization()->id]);
    $otherProject = Project::factory()->create();

    $response = $this->withHeader('Authorization', 'Bearer '.apiToken($user))->getJson('/api/v1/projects');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $ownProject->id);

    expect($response->getContent())->not->toContain($otherProject->id);
});
