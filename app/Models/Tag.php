<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function regulations(): BelongsToMany
    {
        return $this->belongsToMany(Regulation::class, 'regulation_tag');
    }
}
