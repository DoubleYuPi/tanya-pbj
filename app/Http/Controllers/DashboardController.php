<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
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
                'stats' => [
                    'totalRegulations' => Regulation::count(),
                    'activeConversations' => Conversation::whereNotIn('status', ['resolved', 'closed'])->count(),
                    'resolvedConversations' => Conversation::whereIn('status', ['resolved', 'closed'])->count(),
                    'totalQuestions' => Conversation::count(),
                ],
            ]),
            'admin' => Inertia::render('Dashboard/Admin', [
                'currentStatus' => $user->adminProfile?->status ?? 'offline',
                'stats' => [
                    'activeConversations' => Conversation::where('admin_id', $user->id)->whereNotIn('status', ['resolved', 'closed'])->count(),
                    'resolvedConversations' => Conversation::where('admin_id', $user->id)->whereIn('status', ['resolved', 'closed'])->count(),
                    'pendingQuestions' => Conversation::where('admin_id', $user->id)->where('status', 'waiting_for_admin')->count(),
                ],
                'pendingConversations' => Conversation::where('admin_id', $user->id)
                    ->where('status', 'waiting_for_admin')
                    ->with('user')
                    ->orderBy('last_message_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Conversation $c) => [
                        'id' => $c->id,
                        'user_name' => $c->user->name,
                        'subject' => $c->subject,
                        'last_message_at' => $c->last_message_at?->diffForHumans(),
                    ]),
            ]),
            default => Inertia::render('Dashboard/User', [
                'stats' => [
                    'savedRegulations' => $user->bookmarkedRegulations()->count(),
                    'activeConversations' => Conversation::where('user_id', $user->id)->whereNotIn('status', ['resolved', 'closed'])->count(),
                    'resolvedConversations' => Conversation::where('user_id', $user->id)->whereIn('status', ['resolved', 'closed'])->count(),
                ],
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
