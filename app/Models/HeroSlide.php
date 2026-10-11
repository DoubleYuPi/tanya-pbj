<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = ['title', 'subtitle', 'image_path', 'link_url', 'is_active', 'sort_order'];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // Images live on the "public" disk (needs `php artisan storage:link`).
    public function getImageUrlAttribute(): string
    {
        return '/storage/'.$this->image_path;
    }
}
