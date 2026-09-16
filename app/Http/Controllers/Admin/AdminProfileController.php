<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminProfileController extends Controller
{
    // Admin's own profile (spec Part 8/32) — separate from the generic
    // /profile page since Admins manage richer, publicly-shown fields
    // (position, organization, bio, expertise, availability) on top of
    // the basic name/email/phone every role has.
    public function edit(Request $request): Response
    {
        $profile = $request->user()->adminProfile;

        return Inertia::render('Admin/Profile/Edit', [
            'profile' => [
                'name' => $request->user()->name,
                'phone' => $request->user()->phone,
                'position' => $profile?->position,
                'organization' => $profile?->organization,
                'bio' => $profile?->bio,
                'expertise' => $profile?->expertise ?? [],
                'status' => $profile?->status ?? 'offline',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:100'],
            'status' => ['required', Rule::in(['online', 'away', 'offline'])],
        ]);

        $request->user()->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
        ]);

        AdminProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'position' => $validated['position'] ?? null,
                'organization' => $validated['organization'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'expertise' => $validated['expertise'] ?? [],
                'status' => $validated['status'],
                'last_active_at' => now(),
            ]
        );

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    // Lightweight endpoint for the dashboard's quick availability toggle —
    // doesn't require resubmitting the whole profile form just to flip
    // online/away/offline.
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['online', 'away', 'offline'])],
        ]);

        AdminProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['status' => $validated['status'], 'last_active_at' => now()]
        );

        return back()->with('success', 'Status ketersediaan diperbarui.');
    }
}
