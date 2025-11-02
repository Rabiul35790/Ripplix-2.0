<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Interaction extends Model
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

        static::creating(function ($interaction) {
            if (empty($interaction->slug)) {
                $interaction->slug = Str::slug($interaction->name);
            }
        });
    }

    public function libraries(): BelongsToMany
    {
        return $this->belongsToMany(Library::class);
    }
}
