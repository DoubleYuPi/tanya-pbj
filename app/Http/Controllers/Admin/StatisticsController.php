<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Regulation;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Statistics/Index', [
            'totals' => [
                'users' => User::where('role', User::ROLE_USER)->count(),
                'admins' => User::where('role', User::ROLE_ADMIN)->count(),
                'regulations' => Regulation::count(),
                'conversations' => Conversation::count(),
                'activeConversations' => Conversation::whereNotIn('status', ['resolved', 'closed'])->count(),
                'resolvedConversations' => Conversation::whereIn('status', ['resolved', 'closed'])->count(),
            ],
            'conversationsPerMonth' => $this->perMonth(Conversation::query()),
            'usersPerMonth' => $this->perMonth(User::query()->where('role', User::ROLE_USER)),
            'regulationsPerMonth' => $this->perMonth(Regulation::query()),
            'statusBreakdown' => Conversation::query()
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    // Last 6 months of counts, zero-filled so the chart has no gaps.
    // Uses whereBetween on a date range rather than a raw DATE_FORMAT
    // expression so it stays portable across MySQL and SQLite (the test
    // database), instead of only working on one.
    private function perMonth($query): array
    {
        $result = [];

        for ($i = 5; $i >= 0; $i--) {
            $start = Carbon::now()->startOfMonth()->subMonths($i);
            $end = (clone $start)->endOfMonth();

            $result[] = [
                'month' => $start->translatedFormat('M Y'),
                'total' => (clone $query)->whereBetween('created_at', [$start, $end])->count(),
            ];
        }

        return $result;
    }
}
