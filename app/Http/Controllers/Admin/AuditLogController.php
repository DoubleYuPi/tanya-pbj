<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::query()->with('user');

        if ($action = $request->string('action')->value()) {
            $query->where('action', $action);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('actor_name', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest()->paginate(25)->withQueryString();

        $logs->getCollection()->transform(fn (AuditLog $l) => [
            'id' => $l->id,
            'actor_name' => $l->actor_name ?? 'Sistem',
            'action' => $l->action,
            'description' => $l->description,
            'ip_address' => $l->ip_address,
            'created_at' => $l->created_at->format('d M Y H:i'),
        ]);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'availableActions' => AuditLog::query()->distinct()->orderBy('action')->pluck('action'),
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
