<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    // Super Admin user management (spec Part 7). Sits inside the
    // 'role:super_admin' route group; every mutating action also writes
    // an audit log entry (Part 33).
    public function index(Request $request): Response
    {
        $query = User::query()->where('role', User::ROLE_USER);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('satuan_kerja', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(15)->withQueryString();

        $users->getCollection()->transform(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'satuan_kerja' => $u->satuan_kerja,
            'is_active' => $u->is_active,
            'created_at' => $u->created_at->format('d M Y'),
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function toggleActive(Request $request, User $user)
    {
        // Guard against a Super Admin locking themselves out, and against
        // deactivating other super admins through this screen.
        abort_if($user->isSuperAdmin(), 403, 'Akun Super Admin tidak dapat dinonaktifkan dari halaman ini.');

        $user->update(['is_active' => ! $user->is_active]);

        AuditLogger::log(
            $user->is_active ? AuditLog::ACTION_USER_ACTIVATED : AuditLog::ACTION_USER_DEACTIVATED,
            ($user->is_active ? 'Mengaktifkan' : 'Menonaktifkan')." akun {$user->name}",
            $user
        );

        return back()->with('success', $user->is_active ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.');
    }

    public function show(User $user): Response
    {
        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'satuan_kerja' => $user->satuan_kerja,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at->format('d M Y H:i'),
            ],
            'conversationCount' => $user->conversationsAsUser()->count(),
        ]);
    }
}
