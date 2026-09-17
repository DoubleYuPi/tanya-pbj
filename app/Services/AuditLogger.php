<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    // Single entry point for audit trail writes (spec Part 33). Captures
    // actor_name as a snapshot alongside user_id so the log stays readable
    // even if the account is later renamed or deleted.
    public static function log(string $action, ?string $description = null, ?Model $subject = null, array $metadata = []): AuditLog
    {
        $actor = Auth::user();

        return AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'action' => $action,
            'description' => $description,
            'auditable_type' => $subject ? $subject::class : null,
            'auditable_id' => $subject?->getKey(),
            'metadata' => $metadata ?: null,
            'ip_address' => Request::ip(),
        ]);
    }
}
