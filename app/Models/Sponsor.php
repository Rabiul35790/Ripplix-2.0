<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_name',
        'email',
        'phone',
        'address',
        'budget_range_min',
        'budget_range_max',
        'message',
        'sponsorship_goals',
        'is_read',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'budget_range_min' => 'decimal:2',
        'budget_range_max' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    public function markAsUnread()
    {
        $this->update(['is_read' => false]);
    }

    public function getBudgetRangeAttribute()
    {
        if (!$this->budget_range_min && !$this->budget_range_max) {
            return null;
        }

        if ($this->budget_range_min && $this->budget_range_max) {
            return '$' . number_format($this->budget_range_min, 0) . ' - $' . number_format($this->budget_range_max, 0);
        }

        if ($this->budget_range_min) {
            return 'From $' . number_format($this->budget_range_min, 0);
        }

        if ($this->budget_range_max) {
            return 'Up to $' . number_format($this->budget_range_max, 0);
        }

        return null;
    }
}
