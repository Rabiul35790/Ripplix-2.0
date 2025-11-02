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
        'target_url',
        'start_date',
        'end_date',
        'status',
        'position',
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

    public function scopeHome($query)
    {
        return $query->where('position', 'home');
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
}
