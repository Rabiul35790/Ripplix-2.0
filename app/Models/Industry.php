<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Industry extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'is_active', 'is_top'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_top' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($industry) {
            if (empty($industry->slug)) {
                $industry->slug = Str::slug($industry->name);
            }
        });
    }

    public function libraries(): BelongsToMany
    {
        return $this->belongsToMany(Library::class);
    }

    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(IndustryVariant::class, 'industry_industry_variant')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }
}
