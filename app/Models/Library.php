<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Library extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_id',
        'published_date',
        'title',
        'slug',
        'url',
        'video_url',
        'description',
        'video_alt_text',
        'logo',
        'seo_title',
        'meta_description',
        'focus_keyword',
        'keywords',
        'canonical_url',
        'structured_data',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'content_length',
        'readability_score',
        'seo_recommendations',
        'last_seo_check',
        'seo_history',
        'schema_type',
        'breadcrumbs',
        'index_follow',
        'robots_meta',
        'seo_score',
        'is_active',
        'source',
    ];

    protected $casts = [
        'published_date' => 'date',
        'keywords' => 'array',
        'structured_data' => 'array',
        'seo_recommendations' => 'array',
        'seo_history' => 'array',
        'breadcrumbs' => 'array',
        'index_follow' => 'boolean',
        'last_seo_check' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($library) {
            if (empty($library->slug)) {
                $library->slug = Str::slug($library->title);
            }
        });

        static::updating(function ($library) {
            if ($library->isDirty('title') && empty($library->slug)) {
                $library->slug = Str::slug($library->title);
            }
        });
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class);
    }

    public function industries(): BelongsToMany
    {
        return $this->belongsToMany(Industry::class);
    }

    public function interactions(): BelongsToMany
    {
        return $this->belongsToMany(Interaction::class);
    }

    public function calculateSeoScore(): int
    {
        $score = 0;
        $maxScore = 100;

        // Title optimization (20 points)
        if (!empty($this->seo_title)) {
            $titleLength = strlen($this->seo_title);
            if ($titleLength >= 30 && $titleLength <= 60) {
                $score += 20;
            } elseif ($titleLength >= 20 && $titleLength <= 70) {
                $score += 15;
            } elseif (!empty($this->seo_title)) {
                $score += 10;
            }
        }

        // Meta description (15 points)
        if (!empty($this->meta_description)) {
            $metaLength = strlen($this->meta_description);
            if ($metaLength >= 120 && $metaLength <= 160) {
                $score += 15;
            } elseif ($metaLength >= 100 && $metaLength <= 180) {
                $score += 12;
            } elseif (!empty($this->meta_description)) {
                $score += 8;
            }
        }

        // Focus keyword (15 points)
        if (!empty($this->focus_keyword)) {
            $score += 10;

            // Check if focus keyword is in title
            if (!empty($this->seo_title) && stripos($this->seo_title, $this->focus_keyword) !== false) {
                $score += 5;
            }
        }

        // Additional keywords (10 points)
        if (!empty($this->keywords) && is_array($this->keywords) && count($this->keywords) > 0) {
            $score += min(10, count($this->keywords) * 2);
        }

        // Content description (10 points)
        if (!empty($this->description)) {
            $descLength = strlen($this->description);
            if ($descLength >= 150) {
                $score += 10;
            } elseif ($descLength >= 100) {
                $score += 7;
            } elseif ($descLength >= 50) {
                $score += 5;
            }
        }

        // Slug optimization (10 points)
        if (!empty($this->slug)) {
            $score += 5;
            if (!empty($this->focus_keyword) && stripos($this->slug, str_replace(' ', '-', strtolower($this->focus_keyword))) !== false) {
                $score += 5;
            }
        }

        // Video URL present (10 points)
        if (!empty($this->video_url)) {
            $score += 10;
        }

        // Canonical URL (5 points)
        if (!empty($this->canonical_url)) {
            $score += 5;
        }

        // Structured data (5 points)
        if (!empty($this->structured_data)) {
            $score += 5;
        }

        return min($score, $maxScore);
    }

    public function updateSeoScore(): void
    {
        $this->seo_score = $this->calculateSeoScore();
        $this->save();
    }

    public function getSeoScoreColorAttribute(): string
    {
        if ($this->seo_score >= 80) return 'success';
        if ($this->seo_score >= 60) return 'warning';
        return 'danger';
    }

    public function performSeoAnalysis(): array
    {
        $analyzer = new \App\Services\SeoAnalyzerService();
        $analysis = $analyzer->analyzeSeo($this);

        // Update the model with analysis results
        $this->update([
            'seo_score' => $analysis['score'],
            'seo_recommendations' => $analysis['recommendations'],
            'last_seo_check' => now(),
            'seo_history' => $this->updateSeoHistory($analysis['score']),
        ]);

        return $analysis;
    }

    private function updateSeoHistory(int $newScore): array
    {
        $history = $this->seo_history ?? [];
        $history[] = [
            'score' => $newScore,
            'date' => now()->toDateTimeString(),
        ];

        // Keep only last 10 entries
        return array_slice($history, -10);
    }

    public function getAutoSuggestions(): array
    {
        $analyzer = new \App\Services\SeoAnalyzerService();
        return $analyzer->generateAutoSuggestions($this);
    }

    public function getMetaRobots(): string
    {
        if (!$this->is_active) {
            return 'noindex,nofollow';
        }

        return $this->robots_meta ?? 'index,follow';
    }

    public function getOpenGraphData(): array
    {
        return [
            'title' => $this->og_title ?: $this->seo_title ?: $this->title,
            'description' => $this->og_description ?: $this->meta_description ?: Str::limit($this->description, 160),
            'image' => $this->og_image ?: ($this->logo ? asset('storage/' . $this->logo) : null),
            'type' => $this->og_type ?: 'article',
            'url' => $this->canonical_url ?: route('libraries.show', $this->slug),
        ];
    }

    public function getStructuredDataJson(): string
    {
        $data = $this->structured_data ?: $this->getAutoSuggestions()['structured_data'] ?? [];
        return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }


    public function views(): HasMany
    {
        return $this->hasMany(LibraryView::class);
    }

    /**
     * Check if this library has been viewed by the current user/session
     */
    public function hasBeenViewedBy(?int $userId, string $sessionId): bool
    {
        return LibraryView::hasViewed($this->id, $userId, $sessionId);
    }
}
