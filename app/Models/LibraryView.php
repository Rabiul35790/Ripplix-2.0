<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryView extends Model
{
    use HasFactory;

    protected $fillable = [
        'library_id',
        'user_id',
        'session_id',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function library(): BelongsTo
    {
        return $this->belongsTo(Library::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Track a library view for authenticated or unauthenticated user
     */
    public static function trackView(int $libraryId, ?int $userId, string $sessionId): void
    {
        self::updateOrCreate(
            [
                'library_id' => $libraryId,
                'user_id' => $userId,
                'session_id' => $userId ? null : $sessionId,
            ],
            [
                'viewed_at' => now(),
            ]
        );
    }

    /**
     * Check if a library has been viewed by user or session
     */
    public static function hasViewed(int $libraryId, ?int $userId, string $sessionId): bool
    {
        $query = self::where('library_id', $libraryId);

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        return $query->exists();
    }

    /**
     * Get all viewed library IDs for a user or session
     */
    public static function getViewedLibraryIds(?int $userId, string $sessionId): array
    {
        $query = self::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        return $query->pluck('library_id')->toArray();
    }
}
