<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryFollow extends Model
{
    protected $table = 'category_follows';

    protected $fillable = [
        'user_id',
        'category_id'
    ];

    // Optional: Add timestamps if you want created_at/updated_at
    public $timestamps = true;

    // Optional: Add indexes for better query performance
    // (This would go in your migration file, not here)

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Optional: Helper method to check if user follows a category
    public static function isFollowing(int $userId, int $categoryId): bool
    {
        return self::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->exists();
    }

    // Optional: Scope for filtering by user
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
