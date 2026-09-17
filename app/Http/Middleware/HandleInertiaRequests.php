<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'phone' => $request->user()->phone,
                    'satuan_kerja' => $request->user()->satuan_kerja,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Lazy closure so the query only runs when a page actually
            // needs it (Inertia evaluates these per-request, and partial
            // reloads can skip them entirely).
            'notifications' => fn () => $request->user()
                ? $request->user()->notifications()->latest()->limit(10)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'type' => $n->data['type'] ?? null,
                    'conversation_id' => $n->data['conversation_id'] ?? null,
                    'sender_name' => $n->data['sender_name'] ?? ($n->data['resolved_by'] ?? null),
                    'preview' => $n->data['preview'] ?? null,
                    'read_at' => $n->read_at?->toIso8601String(),
                    'created_at' => $n->created_at->diffForHumans(),
                ])
                : [],
            'unreadNotificationCount' => fn () => $request->user()
                ? $request->user()->unreadNotifications()->count()
                : 0,
            'appName' => config('app.name'),
        ];
    }
}
