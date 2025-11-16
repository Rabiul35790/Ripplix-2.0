<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CategoryVariant extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_category_variant')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }
}
