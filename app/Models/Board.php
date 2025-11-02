<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class Board extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'user_id',
        'creator_email',
        'visibility',
        'share_via_link',
        'share_via_email',
        'share_emails',
        'share_token',
    ];

    protected $casts = [
        'share_via_link' => 'boolean',
        'share_via_email' => 'boolean',
        'share_emails' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($board) {
            // Generate share token if either sharing option is enabled
            if (($board->share_via_link || $board->share_via_email) && !$board->share_token) {
                $board->share_token = Str::random(32);
            }
        });

        static::updating(function ($board) {
            // Generate share token if either sharing option is enabled and no token exists
            if (($board->share_via_link || $board->share_via_email) && !$board->share_token) {
                $board->share_token = Str::random(32);
            } elseif (!$board->share_via_link && !$board->share_via_email) {
                // Remove token if both sharing options are disabled
                $board->share_token = null;
            }
        });
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function libraries(): BelongsToMany
    {
        return $this->belongsToMany(Library::class)->withTimestamps();
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSharedViaLink($query)
    {
        return $query->where('share_via_link', true)->whereNotNull('share_token');
    }

    public function scopeSharedViaEmail($query)
    {
        return $query->where('share_via_email', true)->whereNotNull('share_token');
    }

    // Helper methods
    public function getShareUrl(): ?string
    {
        if ((!$this->share_via_link && !$this->share_via_email) || !$this->share_token) {
            return null;
        }

        return url("/boards/shared/{$this->share_token}");
    }

    public function canBeShared(): bool
    {
        return ($this->share_via_link || $this->share_via_email) && !is_null($this->share_token);
    }

    public function hasLibrary($libraryId): bool
    {
        return $this->libraries()->where('library_id', $libraryId)->exists();
    }

    // Static methods for checking user's library status
    public static function getUserBoardsWithLibraryCheck($userId, $libraryId = null)
    {
        $query = self::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->withCount('libraries');

        if ($libraryId) {
            $query->with(['libraries' => function($q) use ($libraryId) {
                $q->where('library_id', $libraryId);
            }]);
        }

        return $query->get()->map(function ($board) use ($libraryId) {
            return [
                'id' => $board->id,
                'name' => $board->name,
                'creator_email' => $board->creator_email,
                'share_via_link' => $board->share_via_link,
                'share_via_email' => $board->share_via_email,
                'share_emails' => $board->share_emails,
                'share_url' => $board->getShareUrl(),
                'created_at' => $board->created_at->format('M j, Y'),
                'libraries_count' => $board->libraries_count,
                'has_library' => $libraryId ? $board->libraries->count() > 0 : false,
            ];
        });
    }

    public static function checkUserHasLibrary($userId, $libraryId)
    {
        return self::forUser($userId)
            ->whereHas('libraries', function($q) use ($libraryId) {
                $q->where('library_id', $libraryId);
            })
            ->exists();
    }

    // Get all library IDs that user has in their boards
    public static function getUserLibraryIds($userId)
    {
        return Cache::remember("user_{$userId}_library_ids", 300, function() use ($userId) {
            return self::forUser($userId)
                ->with('libraries:id')
                ->get()
                ->pluck('libraries')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->values()
                ->toArray();
        });
    }

    // Clear cache when board-library relationships change
    public static function clearUserLibraryCache($userId)
    {
        Cache::forget("user_{$userId}_library_ids");
    }
}
