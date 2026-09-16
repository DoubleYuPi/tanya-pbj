<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDirectoryController extends Controller
{
    // Public admin directory (spec Part 14) — "Pilih admin berdasarkan
    // bidang keahlian yang sesuai dengan pertanyaan Anda." Anyone can
    // browse; starting an actual consultation (Phase 5) will require login.
    private const EXPERTISE_FILTERS = ['Tender', 'E-Katalog', 'Kontrak', 'Swakelola', 'Regulasi', 'Lainnya'];

    public function index(Request $request): Response
    {
        $query = User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('is_active', true)
            ->with('adminProfile');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('adminProfile', function ($aq) use ($search) {
                        $aq->where('position', 'like', "%{$search}%")
                            ->orWhere('organization', 'like', "%{$search}%");
                    });
            });
        }

        if ($expertise = $request->string('expertise')->value()) {
            $query->whereHas('adminProfile', fn ($q) => $q->whereJsonContains('expertise', $expertise));
        }

        $admins = $query->orderBy('name')->paginate(12)->withQueryString();
        $admins->getCollection()->transform(fn (User $admin) => $this->publicAdminData($admin));

        return Inertia::render('Admins/Index', [
            'admins' => $admins,
            'expertiseFilters' => self::EXPERTISE_FILTERS,
            'filters' => $request->only(['search', 'expertise']),
        ]);
    }

    public function show(User $admin): Response
    {
        abort_unless($admin->role === User::ROLE_ADMIN && $admin->is_active, 404);

        $admin->load('adminProfile');

        return Inertia::render('Admins/Show', [
            'admin' => $this->publicAdminData($admin),
            // Real numbers once conversations exist (Phase 5) — spec Part
            // 15 lists these as optional statistics.
            'stats' => [
                'totalConsultations' => 0,
                'answeredQuestions' => 0,
                'averageResponseTime' => null,
            ],
        ]);
    }

    // Only ever expose what's meant to be public — never the admin's
    // email, phone, or other account fields.
    private function publicAdminData(User $admin): array
    {
        return [
            'id' => $admin->id,
            'name' => $admin->name,
            'position' => $admin->adminProfile?->position,
            'organization' => $admin->adminProfile?->organization,
            'bio' => $admin->adminProfile?->bio,
            'expertise' => $admin->adminProfile?->expertise ?? [],
            'status' => $admin->adminProfile?->status ?? 'offline',
        ];
    }
}
