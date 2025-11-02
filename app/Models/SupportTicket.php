<?php

// app/Models/SupportTicket.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'status',
        'priority',
        'is_read_by_admin',
        'is_read_by_user',
        'last_reply_at',
    ];

    protected $casts = [
        'is_read_by_admin' => 'boolean',
        'is_read_by_user' => 'boolean',
        'last_reply_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(SupportReply::class);
    }

    public function getUnreadRepliesCountAttribute(): int
    {
        return $this->replies()->where('is_read', false)->count();
    }

    public function getLastReplyAttribute()
    {
        return $this->replies()->latest()->first();
    }
}
