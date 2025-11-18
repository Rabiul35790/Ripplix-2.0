<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class IndustryVariant extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function industries(): BelongsToMany
    {
        return $this->belongsToMany(Industry::class, 'industry_industry_variant')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }
}
