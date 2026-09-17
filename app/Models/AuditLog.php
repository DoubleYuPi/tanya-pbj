<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public const ACTION_ADMIN_CREATED = 'admin.created';
    public const ACTION_ADMIN_UPDATED = 'admin.updated';
    public const ACTION_USER_ACTIVATED = 'user.activated';
    public const ACTION_USER_DEACTIVATED = 'user.deactivated';
    public const ACTION_REGULATION_CREATED = 'regulation.created';
    public const ACTION_REGULATION_UPDATED = 'regulation.updated';
    public const ACTION_REGULATION_DELETED = 'regulation.deleted';
    public const ACTION_SETTINGS_UPDATED = 'settings.updated';

    protected $fillable = [
        'user_id',
        'actor_name',
        'action',
        'description',
        'auditable_type',
        'auditable_id',
        'metadata',
        'ip_address',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable()
    {
        return $this->morphTo();
    }
}
