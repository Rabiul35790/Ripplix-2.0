<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Curator extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'image',
        'image_name',
        'social_links',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'social_links' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return Storage::url($this->image);
    }

    /**
     * Check if curator has any social links
     */
    public function hasSocialLinks(): bool
    {
        return !empty($this->social_links) && count($this->social_links) > 0;
    }

    /**
     * Get a specific social link by platform
     */
    public function getSocialLink(string $platform): ?string
    {
        if (empty($this->social_links)) {
            return null;
        }

        foreach ($this->social_links as $link) {
            if (($link['platform'] ?? '') === $platform) {
                return $link['url'] ?? null;
            }
        }

        return null;
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($curator) {
            if ($curator->image && Storage::exists($curator->image)) {
                Storage::delete($curator->image);
            }
        });
    }
}
