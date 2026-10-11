<?php

use App\Http\Web\Controllers\MilestoneController;
use App\Http\Web\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive');
    Route::post('projects/{project}/unarchive', [ProjectController::class, 'unarchive'])->name('projects.unarchive');

    Route::post('projects/{project}/milestones', [MilestoneController::class, 'store'])->name('milestones.store');
});
