<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UkpbjSection extends Model
{
    protected $fillable = ['key', 'title', 'content'];

    // Routes use /admin/profil-ukpbj/visi-misi/edit instead of numeric IDs.
    public function getRouteKeyName(): string
    {
        return 'key';
    }

    public function images(): HasMany
    {
        return $this->hasMany(UkpbjSectionImage::class)->orderBy('sort_order')->orderBy('id');
    }
}
