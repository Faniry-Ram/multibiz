<?php

use App\Http\Api\Controllers\V1\AuthController;
use App\Http\Api\Controllers\V1\EntryController;
use App\Http\Api\Controllers\V1\ProjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile sync API — skeleton (Phase 1)
|--------------------------------------------------------------------------
|
| Token-authenticated (Sanctum personal access tokens, not the web session
| guard — see ADR 0001). Controllers call the same Domain Actions as the
| web controllers; nothing is duplicated. The full push/pull sync
| endpoints (SyncRegistry, /api/v1/sync/*) are Phase 5 — not built yet.
*/
Route::prefix('v1')->group(function () {
    Route::post('login', [AuthController::class, 'store'])->name('api.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('api.logout');
        Route::get('projects', [ProjectController::class, 'index'])->name('api.projects.index');
        Route::post('entries', [EntryController::class, 'store'])->name('api.entries.store');
    });
});
