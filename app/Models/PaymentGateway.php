<?php
// app/Models/PaymentGateway.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentGateway extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'publishable_key',
        'secret_key',
        'mode',
        'is_active',
        'config'
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'secret_key' => 'encrypted',
        'publishable_key' => 'encrypted',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function getActiveGateway()
    {
        return static::active()->first();
    }
}
