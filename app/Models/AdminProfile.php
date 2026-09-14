<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminProfile extends Model
{
    use HasFactory;

    public const STATUS_ONLINE = 'online';
    public const STATUS_AWAY = 'away';
    public const STATUS_OFFLINE = 'offline';

    protected $fillable = [
        'user_id',
        'position',
        'organization',
        'expertise',
        'bio',
        'avatar_path',
        'status',
        'last_active_at',
    ];

    protected function casts(): array
    {
        return [
            'expertise' => 'array',
            'last_active_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_ONLINE;
    }
}
