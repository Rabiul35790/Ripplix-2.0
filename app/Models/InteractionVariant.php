<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InteractionVariant extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function interactions(): BelongsToMany
    {
        return $this->belongsToMany(Interaction::class, 'interaction_interaction_variant')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }
}
