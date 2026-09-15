<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
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
            'admin' => Inertia::render('Dashboard/Admin'),
            default => Inertia::render('Dashboard/User', [
                'stats' => ['savedRegulations' => $user->bookmarkedRegulations()->count()],
            ]),
        };
    }
}
