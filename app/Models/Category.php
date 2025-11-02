<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'image', 'is_active', 'is_top'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_top' =>'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function libraries(): BelongsToMany
    {
        return $this->belongsToMany(Library::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(CategoryFollow::class);
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'category_follows', 'category_id', 'user_id')
                    ->withTimestamps();
    }

    public function isFollowedBy($userId): bool
    {
        if (!$userId) return false;

        return $this->follows()->where('user_id', $userId)->exists();
    }
}
