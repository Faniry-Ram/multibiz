<?php

use App\Http\Web\Controllers\BatchController;
use App\Http\Web\Controllers\CategoryController;
use App\Http\Web\Controllers\EntryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('projects/{project}/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::post('categories/{category}/archive', [CategoryController::class, 'archive'])->name('categories.archive');

    // Entries are append-only: no update/delete routes — see docs/audit-architecture.md.
    Route::post('projects/{project}/entries', [EntryController::class, 'store'])->name('entries.store');
    Route::post('entries/{entry}/reverse', [EntryController::class, 'reverse'])->name('entries.reverse');

    Route::post('projects/{project}/batches', [BatchController::class, 'store'])->name('batches.store');
    Route::post('batches/{batch}/close', [BatchController::class, 'close'])->name('batches.close');
});
