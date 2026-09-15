<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBookmark extends Model
{
    protected $fillable = ['user_id', 'regulation_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function regulation(): BelongsTo
    {
        return $this->belongsTo(Regulation::class);
    }
}
