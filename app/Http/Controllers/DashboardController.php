<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Single /dashboard entry point that renders the correct role-specific
    // page (spec Part 12: redirect target after auth differs per role).
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            'super_admin' => Inertia::render('Dashboard/SuperAdmin', [
                'stats' => ['totalRegulations' => Regulation::count()],
            ]),
            'admin' => Inertia::render('Dashboard/Admin', [
                'currentStatus' => $user->adminProfile?->status ?? 'offline',
            ]),
            default => Inertia::render('Dashboard/User', [
                'stats' => ['savedRegulations' => $user->bookmarkedRegulations()->count()],
                'availableAdmins' => User::query()
                    ->where('role', User::ROLE_ADMIN)
                    ->where('is_active', true)
                    ->whereHas('adminProfile', fn ($q) => $q->where('status', 'online'))
                    ->with('adminProfile')
                    ->limit(3)
                    ->get()
                    ->map(fn (User $admin) => [
                        'id' => $admin->id,
                        'name' => $admin->name,
                        'position' => $admin->adminProfile?->position,
                        'organization' => $admin->adminProfile?->organization,
                    ]),
            ]),
        };
    }
}
