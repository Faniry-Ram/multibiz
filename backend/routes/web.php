<?php

use App\Http\Web\Controllers\DashboardController;
use App\Http\Web\Controllers\HistoryController;
use App\Http\Web\Controllers\PocketController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('pocket', [PocketController::class, 'index'])->name('pocket');
    Route::get('historique', [HistoryController::class, 'index'])->name('history');
});

if (app()->environment('local')) {
    Route::inertia('_dev/ui', 'dev/ui')->name('dev.ui');
}

require __DIR__.'/settings.php';
require __DIR__.'/projects.php';
require __DIR__.'/finance.php';
