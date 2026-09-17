<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AdminManagementController extends Controller
{
    // Super Admin creates/edits Admin accounts (spec Part 7) — this is the
    // ONLY way an admin account comes into existence; public registration
    // always creates plain users.
    public function index(Request $request): Response
    {
        $query = User::query()->where('role', User::ROLE_ADMIN)->with('adminProfile');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
        }

        $admins = $query->orderBy('name')->paginate(15)->withQueryString();

        $admins->getCollection()->transform(fn (User $a) => [
            'id' => $a->id,
            'name' => $a->name,
            'email' => $a->email,
            'position' => $a->adminProfile?->position,
            'organization' => $a->adminProfile?->organization,
            'expertise' => $a->adminProfile?->expertise ?? [],
            'status' => $a->adminProfile?->status ?? 'offline',
            'is_active' => $a->is_active,
        ]);

        return Inertia::render('Admin/Admins/Index', [
            'admins' => $admins,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Admins/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'position' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:100'],
        ]);

        $admin = DB::transaction(function () use ($validated) {
            $admin = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => User::ROLE_ADMIN,
                // Created by a Super Admin, so treat the address as
                // already trusted rather than blocking on verification.
                'email_verified_at' => now(),
            ]);

            AdminProfile::create([
                'user_id' => $admin->id,
                'position' => $validated['position'] ?? null,
                'organization' => $validated['organization'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'expertise' => $validated['expertise'] ?? [],
                'status' => AdminProfile::STATUS_OFFLINE,
            ]);

            return $admin;
        });

        AuditLogger::log(AuditLog::ACTION_ADMIN_CREATED, "Membuat akun admin {$admin->name}", $admin);

        return to_route('admin.admins.index')->with('success', "Akun admin {$admin->name} berhasil dibuat.");
    }

    public function edit(User $admin): Response
    {
        abort_unless($admin->isAdmin(), 404);

        $admin->load('adminProfile');

        return Inertia::render('Admin/Admins/Edit', [
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'position' => $admin->adminProfile?->position,
                'organization' => $admin->adminProfile?->organization,
                'bio' => $admin->adminProfile?->bio,
                'expertise' => $admin->adminProfile?->expertise ?? [],
                'is_active' => $admin->is_active,
            ],
        ]);
    }

    public function update(Request $request, User $admin)
    {
        abort_unless($admin->isAdmin(), 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            // Optional on edit — only set a new password if one is given.
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'position' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $admin) {
            $admin->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'is_active' => $validated['is_active'],
                ...(! empty($validated['password']) ? ['password' => Hash::make($validated['password'])] : []),
            ]);

            AdminProfile::updateOrCreate(
                ['user_id' => $admin->id],
                [
                    'position' => $validated['position'] ?? null,
                    'organization' => $validated['organization'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                    'expertise' => $validated['expertise'] ?? [],
                ]
            );
        });

        AuditLogger::log(AuditLog::ACTION_ADMIN_UPDATED, "Memperbarui akun admin {$admin->name}", $admin);

        return to_route('admin.admins.index')->with('success', 'Akun admin berhasil diperbarui.');
    }
}
