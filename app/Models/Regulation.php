<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Regulation extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'regulation_category_id',
        'title',
        'document_number',
        'year',
        'issuing_institution',
        'effective_date',
        'description',
        'file_disk',
        'file_path',
        'file_original_name',
        'file_size',
        'status',
        'is_sample_data',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'is_sample_data' => 'boolean',
            'year' => 'integer',
            'file_size' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RegulationCategory::class, 'regulation_category_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'regulation_tag');
    }

    public function bookmarkedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_bookmarks')->withTimestamps();
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }
}
