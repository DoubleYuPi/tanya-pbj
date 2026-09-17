<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_OPEN = 'open';
    public const STATUS_WAITING_ADMIN = 'waiting_for_admin';
    public const STATUS_WAITING_USER = 'waiting_for_user';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'user_id',
        'admin_id',
        'subject',
        'category',
        'status',
        'last_message_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function isResolved(): bool
    {
        return in_array($this->status, [self::STATUS_RESOLVED, self::STATUS_CLOSED], true);
    }

    // The other party from the given user's point of view — used to
    // render "who am I talking to" in the chat header/list without the
    // frontend needing to know about user_id vs admin_id.
    public function counterpart(User $viewer): ?User
    {
        if ($viewer->id === $this->user_id) {
            return $this->admin;
        }

        return $this->user;
    }
}
