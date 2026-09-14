<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

/*
|--------------------------------------------------------------------------
| Authenticated routes — role redirect handled inside DashboardController
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Reserved route groups per the spec's route map (Part 41).
| Controllers/pages for these land in later phases:
|   /peraturan, /peraturan/{regulation}, /peraturan/tersimpan  → Phase 3
|   /admins, /admins/{admin}                                    → Phase 4
|   /chat, /chat/{conversation}                                 → Phase 5
|   /admin/users, /admin/admins, /admin/peraturan, /admin/categories,
|   /admin/audit-logs, /admin/settings                          → Phase 7
| The role-scoped groups below exist now so AppLayout's nav links and the
| role middleware are already correct; only the dashboard route inside
| each group is wired up so far.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Admin'))->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->name('super-admin.')->group(function () {
    Route::get('/super-dashboard', fn () => Inertia::render('Dashboard/SuperAdmin'))->name('dashboard');
});

require __DIR__.'/auth.php';
