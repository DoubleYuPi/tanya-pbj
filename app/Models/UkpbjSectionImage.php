<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UkpbjSectionImage extends Model
{
    public const DISK = 'public';

    protected $fillable = ['ukpbj_section_id', 'path', 'caption', 'sort_order'];

    protected $appends = ['url'];

    // Relative URL (/storage/...) so it works on any host without
    // depending on APP_URL being correct.
    protected function url(): Attribute
    {
        return Attribute::get(fn () => '/storage/'.$this->path);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(UkpbjSection::class, 'ukpbj_section_id');
    }
}
