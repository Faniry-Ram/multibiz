<?php

use App\Domain\Organization\Enums\Role;

test('only owner and manager can manage projects', function () {
    expect(Role::Owner->canManageProjects())->toBeTrue()
        ->and(Role::Manager->canManageProjects())->toBeTrue()
        ->and(Role::Entry->canManageProjects())->toBeFalse()
        ->and(Role::Viewer->canManageProjects())->toBeFalse();
});

test('every role except viewer can record entries', function () {
    expect(Role::Owner->canRecordEntries())->toBeTrue()
        ->and(Role::Manager->canRecordEntries())->toBeTrue()
        ->and(Role::Entry->canRecordEntries())->toBeTrue()
        ->and(Role::Viewer->canRecordEntries())->toBeFalse();
});

test('pocket and analytics access is denied to the entry role only', function () {
    expect(Role::Owner->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Manager->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Viewer->canAccessPocketAndAnalytics())->toBeTrue()
        ->and(Role::Entry->canAccessPocketAndAnalytics())->toBeFalse();
});
