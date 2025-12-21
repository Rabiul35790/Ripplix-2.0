<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
        'author_details',
        'author_social_links',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_published',
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'featured_images' => 'array',
        'author_social_links' => 'array',
        'published_date' => 'date',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
    ];

    // Add this accessor to automatically convert image paths to full URLs
    protected $appends = ['featured_image_urls'];

    public function getFeaturedImageUrlsAttribute()
    {
        if (empty($this->featured_images)) {
            return [];
        }

        return array_map(function ($image) {
            // If the image is already a full URL, return it as is
            if (Str::startsWith($image, ['http://', 'https://'])) {
                return $image;
            }

            // If the image path starts with 'storage/', use asset helper
            if (Str::startsWith($image, 'storage/')) {
                return asset($image);
            }

            // Otherwise, assume it's stored in storage/app/public
            return Storage::url($image);
        }, $this->featured_images);
    }

    /**
     * Get formatted author social links with icons
     */
    public function getFormattedSocialLinksAttribute()
    {
        if (empty($this->author_social_links)) {
            return [];
        }

        $iconMap = [
            'facebook' => 'fab fa-facebook',
            'twitter' => 'fab fa-twitter',
            'instagram' => 'fab fa-instagram',
            'linkedin' => 'fab fa-linkedin',
            'youtube' => 'fab fa-youtube',
            'github' => 'fab fa-github',
            'tiktok' => 'fab fa-tiktok',
            'pinterest' => 'fab fa-pinterest',
            'website' => 'fas fa-globe',
            'other' => 'fas fa-link',
        ];

        return array_map(function ($link) use ($iconMap) {
            return [
                'platform' => $link['platform'] ?? 'other',
                'url' => $link['url'] ?? '',
                'icon' => $iconMap[$link['platform'] ?? 'other'] ?? 'fas fa-link',
                'label' => ucfirst($link['platform'] ?? 'Link'),
            ];
        }, $this->author_social_links);
    }

    /**
     * Get a specific social link by platform
     */
    public function getSocialLink(string $platform): ?string
    {
        if (empty($this->author_social_links)) {
            return null;
        }

        foreach ($this->author_social_links as $link) {
            if (($link['platform'] ?? '') === $platform) {
                return $link['url'] ?? null;
            }
        }

        return null;
    }

    /**
     * Check if author has any social links
     */
    public function hasSocialLinks(): bool
    {
        return !empty($this->author_social_links) && count($this->author_social_links) > 0;
    }

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
