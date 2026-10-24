<?php

test('the health check endpoint responds', function () {
    $response = $this->get('/up');

    $response->assertOk();
});
