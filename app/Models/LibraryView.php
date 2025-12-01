<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
     * Track a library view - OPTIMIZED with better error handling
     */
    public static function trackView(int $libraryId, ?int $userId, string $sessionId): void
    {
        try {
            // Use upsert for better performance (single query)
            DB::table('library_views')->upsert(
                [
                    'library_id' => $libraryId,
                    'user_id' => $userId,
                    'session_id' => $userId ? null : $sessionId,
                    'viewed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                // Unique constraints
                $userId
                    ? ['library_id', 'user_id']
                    : ['library_id', 'session_id'],
                // Columns to update
                ['viewed_at', 'updated_at']
            );
        } catch (\Exception $e) {
            // Log error but don't throw - view tracking is non-critical
            Log::error('Failed to track library view', [
                'library_id' => $libraryId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if a library has been viewed - OPTIMIZED
     */
    public static function hasViewed(int $libraryId, ?int $userId, string $sessionId): bool
    {
        try {
            $query = self::where('library_id', $libraryId);

            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            return $query->exists();
        } catch (\Exception $e) {
            Log::error('Failed to check library view', [
                'library_id' => $libraryId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get all viewed library IDs - OPTIMIZED with caching
     */
    public static function getViewedLibraryIds(?int $userId, string $sessionId): array
    {
        try {
            $query = self::query();

            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            return $query->pluck('library_id')->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get viewed library IDs', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
