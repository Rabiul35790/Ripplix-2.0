<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'video',
        'media_type',
        'target_url',
        'start_date',
        'end_date',
        'status',
        'position',
        'in_feed_name',
        'in_feed_link',
        'clicks',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'clicks' => 'integer',
    ];

    /**
     * Scope to get only active ads
     */
    public function scopeActive($query)
    {
        $currentDate = now()->format('Y-m-d');

        return $query->where('status', 'active')
                    ->whereDate('start_date', '<=', $currentDate)
                    ->whereDate('end_date', '>=', $currentDate);
    }

    /**
     * Scope to get sidebar ads
     */
    public function scopeSidebar($query)
    {
        return $query->where('position', 'sidebar');
    }

    /**
     * Scope to get modal ads
     */
    public function scopeModal($query)
    {
        return $query->where('position', 'modal');
    }

    /**
     * Scope to get home ads
     */
    public function scopeHome($query)
    {
        return $query->where('position', 'home');
    }

    /**
     * Scope to get in-feed ads
     */
    public function scopeInFeed($query)
    {
        return $query->where('position', 'in-feed');
    }

    /**
     * Increment click count
     */
    public function incrementClicks()
    {
        $this->increment('clicks');
    }

    /**
     * Check if ad is currently active
     */
    public function isCurrentlyActive(): bool
    {
        $currentDate = Carbon::now()->format('Y-m-d');
        $startDate = Carbon::parse($this->start_date)->format('Y-m-d');
        $endDate = Carbon::parse($this->end_date)->format('Y-m-d');

        return $this->status === 'active' &&
               $startDate <= $currentDate &&
               $endDate >= $currentDate;
    }

    /**
     * Get the full image URL
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image ? asset('storage/' . $this->image) : null,
        );
    }

    /**
     * Get the full video URL
     */
    protected function videoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->video ? asset('storage/' . $this->video) : null,
        );
    }

    /**
     * Get the media URL (either image or video)
     */
    protected function mediaUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->media_type === 'video' ? $this->video_url : $this->image_url,
        );
    }

    /**
     * Check if this is a video ad
     */
    public function isVideo(): bool
    {
        return $this->media_type === 'video';
    }

    /**
     * Check if this is an image ad
     */
    public function isImage(): bool
    {
        return $this->media_type === 'image';
    }
}
