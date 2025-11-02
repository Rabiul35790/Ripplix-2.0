<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCookie extends Model
{
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'cookie_data',
        'session_id',
        'accepted_at',
    ];

    protected $casts = [
        'cookie_data' => 'array',
        'accepted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
