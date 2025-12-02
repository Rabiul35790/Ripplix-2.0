<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Legal extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'content',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scope to get active records
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope to get privacy policy
    public function scopePrivacyPolicy($query)
    {
        return $query->where('type', 'privacy_policy');
    }

    // Scope to get terms and conditions
    public function scopeTermsConditions($query)
    {
        return $query->where('type', 'terms_conditions');
    }

    public function scopeCookiePolicy($query)
    {
        return $query->where('type', 'cookie_policy');
    }

    public function scopeDisclaimer($query)
    {
        return $query->where('type', 'disclaimer');
    }
        public function scopeReportContentPolicy($query)
    {
        return $query->where('type', 'report_content_policy');
    }



    // Get type label
    public function getTypeLabelAttribute()
    {
        return match ($this->type) {
            'privacy_policy' => 'Privacy Policy',
            'terms_conditions' => 'Terms of Service',
            'cookie_policy' => 'Cookie Policy',
            'disclaimer' => 'Disclaimer',
            'report_content_policy' => 'Report Content Policy',
            default => ucfirst(str_replace('_', ' ', $this->type)),
        };
    }
}
