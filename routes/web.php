<?php

use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\RegulationCategoryController;
use App\Http\Controllers\Admin\RegulationController as AdminRegulationController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\AdminDirectoryController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\SearchController;
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

// Admin directory (spec Part 14/15) is public browsing — only starting an
// actual consultation (Phase 5) needs an account.
Route::get('/admins', [AdminDirectoryController::class, 'index'])->name('admins.index');
Route::get('/admins/{admin}', [AdminDirectoryController::class, 'show'])->name('admins.show');

// Regulation library is public (Part 20/21 — public government
// information); only bookmarking requires an account (Part 26). Placed
// above the bookmarks route so "/peraturan/tersimpan" isn't swallowed by
// the "/peraturan/{regulation}" wildcard.
Route::get('/peraturan', [RegulationController::class, 'index'])->name('regulations.index');

// Global search across regulations + admins (spec Part 25).
Route::get('/cari', [SearchController::class, 'index'])->name('search');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/peraturan/tersimpan', [BookmarkController::class, 'index'])->name('regulations.bookmarks');
    Route::post('/peraturan/{regulation}/bookmark', [BookmarkController::class, 'store'])->name('regulations.bookmark');
    Route::delete('/peraturan/{regulation}/bookmark', [BookmarkController::class, 'destroy'])->name('regulations.unbookmark');
});

Route::get('/peraturan/{regulation}', [RegulationController::class, 'show'])->name('regulations.show');
Route::get('/peraturan/{regulation}/download', [RegulationController::class, 'download'])->name('regulations.download');
Route::get('/peraturan/{regulation}/preview', [RegulationController::class, 'preview'])->name('regulations.preview');

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

    // Attachment downloads are shared across both /chat and /admin/chat —
    // ConversationPolicy inside the controller handles authorization
    // regardless of which side is requesting, so one route covers both.
    Route::get('/chat/attachments/{attachment}/download', [ChatController::class, 'downloadAttachment'])->name('chat.attachments.download');

    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
});

/*
|--------------------------------------------------------------------------
| User chat routes (spec Part 16-19, 41). role:user only — Admin uses the
| mirrored /admin/chat group below via the same ChatController.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::post('/chat/{conversation}/messages', [ChatController::class, 'storeMessage'])->name('chat.messages.store');
    Route::post('/chat/{conversation}/resolve', [ChatController::class, 'resolve'])->name('chat.resolve');
    Route::post('/chat/{conversation}/reopen', [ChatController::class, 'reopen'])->name('chat.reopen');
});

/*
|--------------------------------------------------------------------------
| Reserved route groups per the spec's route map (Part 41).
| Controllers/pages for these land in later phases:
|   /admin/settings → not yet implemented (Phase 8 / future)
|
| Note: the spec's Part 29 and Part 30 both assign "/admin/dashboard" to
| two different roles (Super Admin and Admin). Resolved here by following
| Part 41's explicit route table, which only lists /admin/dashboard under
| Admin — Super Admin's dashboard is the shared, role-aware /dashboard
| above (DashboardController already renders the right page per role),
| so there's no need for a second URL just for that role.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Admin'))->name('dashboard');

    Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
    Route::patch('/availability', [AdminProfileController::class, 'updateStatus'])->name('availability.update');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/messages', [ChatController::class, 'storeMessage'])->name('chat.messages.store');
    Route::post('/chat/{conversation}/resolve', [ChatController::class, 'resolve'])->name('chat.resolve');
    Route::post('/chat/{conversation}/reopen', [ChatController::class, 'reopen'])->name('chat.reopen');
});

/*
|--------------------------------------------------------------------------
| Super Admin regulation CMS (Part 23/24) — deliberately its own
| 'role:super_admin' group rather than reusing the 'admin' group above,
| since a plain Admin must NOT be able to upload/edit/delete regulations.
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/peraturan', [AdminRegulationController::class, 'index'])->name('regulations.index');
    Route::get('/peraturan/create', [AdminRegulationController::class, 'create'])->name('regulations.create');
    Route::post('/peraturan', [AdminRegulationController::class, 'store'])->name('regulations.store');
    Route::get('/peraturan/{regulation}/edit', [AdminRegulationController::class, 'edit'])->name('regulations.edit');
    Route::put('/peraturan/{regulation}', [AdminRegulationController::class, 'update'])->name('regulations.update');
    Route::delete('/peraturan/{regulation}', [AdminRegulationController::class, 'destroy'])->name('regulations.destroy');
    Route::get('/peraturan/{regulation}/download', [AdminRegulationController::class, 'download'])->name('regulations.download');

    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('users.toggleActive');

    Route::get('/admins', [AdminManagementController::class, 'index'])->name('admins.index');
    Route::get('/admins/create', [AdminManagementController::class, 'create'])->name('admins.create');
    Route::post('/admins', [AdminManagementController::class, 'store'])->name('admins.store');
    Route::get('/admins/{admin}/edit', [AdminManagementController::class, 'edit'])->name('admins.edit');
    Route::put('/admins/{admin}', [AdminManagementController::class, 'update'])->name('admins.update');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');

    Route::get('/categories', [RegulationCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [RegulationCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [RegulationCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [RegulationCategoryController::class, 'destroy'])->name('categories.destroy');
});

require __DIR__.'/auth.php';
