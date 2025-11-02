<?php
// app/Models/VisitorSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class VisitorSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'ip_address',
        'user_agent',
        'last_activity',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
    ];

    /**
     * Get active visitors count (last 30 minutes)
     */
    public static function getActiveVisitorsCount(): int
    {
        return static::where('last_activity', '>=', Carbon::now()->subMinutes(30))->count();
    }

    /**
     * Track or update visitor session
     */
    public static function trackVisitor(): void
    {
        $sessionId = session()->getId();
        $ipAddress = request()->ip();
        $userAgent = request()->userAgent();

        static::updateOrCreate(
            ['session_id' => $sessionId],
            [
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'last_activity' => Carbon::now(),
            ]
        );
    }

    /**
     * Clean up old visitor sessions (older than 24 hours)
     */
    public static function cleanup(): int
    {
        return static::where('last_activity', '<', Carbon::now()->subHours(24))->delete();
    }
}
