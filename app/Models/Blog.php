<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'blog_category_id',
        'featured_images',
        'published_date',
        'author',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_published',
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'featured_images' => 'array',
        'published_date' => 'date',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = Str::slug($blog->title);
            }

            // Ensure unique slug
            $originalSlug = $blog->slug;
            $count = 1;
            while (static::where('slug', $blog->slug)->exists()) {
                $blog->slug = $originalSlug . '-' . $count;
                $count++;
            }

            // Auto-generate meta fields if empty
            if (empty($blog->meta_title)) {
                $blog->meta_title = Str::limit($blog->title, 60);
            }

            if (empty($blog->meta_description) && !empty($blog->excerpt)) {
                $blog->meta_description = Str::limit($blog->excerpt, 160);
            }

            // Set author if empty
            if (empty($blog->author) && auth()->check()) {
                $blog->author = auth()->user()->name ?? 'Admin';
            }
        });

        static::updating(function ($blog) {
            if ($blog->isDirty('title') && !$blog->isDirty('slug')) {
                $blog->slug = Str::slug($blog->title);

                // Ensure unique slug
                $originalSlug = $blog->slug;
                $count = 1;
                while (static::where('slug', $blog->slug)->where('id', '!=', $blog->id)->exists()) {
                    $blog->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
