<?php

namespace App\Services;

use App\Models\Library;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class SeoAnalyzerService
{
    private array $recommendations = [];
    private int $score = 0;

    public function analyzeSeo(Library $library): array
    {
        $this->score = 0;
        $this->recommendations = [];

        // Analyze different SEO aspects
        $this->analyzeTitleSeo($library);
        $this->analyzeMetaDescription($library);
        $this->analyzeContentQuality($library);
        $this->analyzeKeywordUsage($library);
        $this->analyzeStructuredData($library);
        $this->analyzeTechnicalSeo($library);
        $this->analyzeReadability($library);

        return [
            'score' => min($this->score, 100),
            'recommendations' => $this->recommendations,
            'grade' => $this->getGrade($this->score),
        ];
    }

    private function analyzeTitleSeo(Library $library): void
    {
        $title = $library->seo_title ?: $library->title;
        $length = strlen($title);

        if (empty($title)) {
            $this->recommendations[] = [
                'type' => 'error',
                'message' => 'SEO title is missing',
                'priority' => 'high'
            ];
            return;
        }

        if ($length == 0) {
        $this->recommendations[] = [
            'type' => 'error',
            'message' => 'SEO title is missing',
            'priority' => 'medium'
        ];
        // No score added for missing title
    } elseif ($length < 30) {
        $this->recommendations[] = [
            'type' => 'warning',
            'message' => 'SEO title is too short (recommended: 30-60 characters)',
            'priority' => 'medium'
        ];
        $this->score += 10;
    } elseif ($length > 60) {
        $this->recommendations[] = [
            'type' => 'warning',
            'message' => 'SEO title is too long and may be truncated',
            'priority' => 'medium'
        ];
        $this->score += 15;
    } else {
        $this->score += 25;
    }

        // Check for focus keyword in title
        if ($library->focus_keyword && stripos($title, $library->focus_keyword) !== false) {
            $this->score += 5;
        } else {
            $this->recommendations[] = [
                'type' => 'info',
                'message' => 'Consider including focus keyword in title',
                'priority' => 'low'
            ];
        }
    }

    private function analyzeMetaDescription(Library $library): void
    {
        $meta = $library->meta_description;
        $length = strlen($meta ?? '');

        if (empty($meta)) {
            $this->recommendations[] = [
                'type' => 'error',
                'message' => 'Meta description is missing',
                'priority' => 'high'
            ];
            return;
        }

        if ($length < 120) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Meta description is too short (recommended: 120-160 characters)',
                'priority' => 'medium'
            ];
            $this->score += 10;
        } elseif ($length > 160) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Meta description is too long and may be truncated',
                'priority' => 'medium'
            ];
            $this->score += 12;
        } else {
            $this->score += 20;
        }

        // Check for focus keyword in meta description
        if ($library->focus_keyword && stripos($meta, $library->focus_keyword) !== false) {
            $this->score += 5;
        }
    }

    private function analyzeContentQuality(Library $library): void
    {
        $content = $library->description ?? '';
        $length = strlen($content);

        if ($length < 100) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Content description is too short for good SEO',
                'priority' => 'medium'
            ];
            $this->score += 5;
        } elseif ($length < 300) {
            $this->score += 10;
        } else {
            $this->score += 15;
        }

        // Update content length
        $library->update(['content_length' => $length]);
    }

    private function analyzeKeywordUsage(Library $library): void
    {
        if (empty($library->focus_keyword)) {
            $this->recommendations[] = [
                'type' => 'error',
                'message' => 'Focus keyword is not defined',
                'priority' => 'high'
            ];
            return;
        }

        $this->score += 10;

        // Check keyword density
        $content = strtolower($library->description ?? '');
        $keyword = strtolower($library->focus_keyword);
        $keywordCount = substr_count($content, $keyword);
        $totalWords = str_word_count($content);

        if ($totalWords > 0) {
            $density = ($keywordCount / $totalWords) * 100;

            if ($density < 0.5) {
                $this->recommendations[] = [
                    'type' => 'info',
                    'message' => 'Consider using focus keyword more in content',
                    'priority' => 'low'
                ];
            } elseif ($density > 3) {
                $this->recommendations[] = [
                    'type' => 'warning',
                    'message' => 'Focus keyword might be overused (keyword stuffing)',
                    'priority' => 'medium'
                ];
            } else {
                $this->score += 5;
            }
        }
    }

    private function analyzeStructuredData(Library $library): void
    {
        if (empty($library->structured_data)) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Structured data is missing - consider adding schema markup',
                'priority' => 'medium'
            ];
            return;
        }

        $this->score += 10;

        // Validate structured data
        $structuredData = is_array($library->structured_data) ? $library->structured_data : [];
        $requiredFields = ['@type', 'name', 'description'];

        foreach ($requiredFields as $field) {
            if (!isset($structuredData[$field])) {
                $this->recommendations[] = [
                    'type' => 'info',
                    'message' => "Structured data missing required field: {$field}",
                    'priority' => 'low'
                ];
            }
        }
    }

    private function analyzeTechnicalSeo(Library $library): void
    {
        // Check slug optimization
        if (empty($library->slug)) {
            $this->recommendations[] = [
                'type' => 'error',
                'message' => 'URL slug is missing',
                'priority' => 'high'
            ];
        } else {
            $this->score += 5;

            // Check if slug contains focus keyword
            if ($library->focus_keyword && stripos($library->slug, Str::slug($library->focus_keyword)) !== false) {
                $this->score += 5;
            }
        }

        // Check canonical URL
        if (empty($library->canonical_url)) {
            $this->recommendations[] = [
                'type' => 'info',
                'message' => 'Canonical URL is not set',
                'priority' => 'low'
            ];
        } else {
            $this->score += 5;
        }

        // Check video URL
        if (empty($library->video_url)) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Video URL is missing',
                'priority' => 'medium'
            ];
        } else {
            $this->score += 10;
        }
    }

    private function analyzeReadability(Library $library): void
    {
        $content = $library->description ?? '';
        $readabilityScore = $this->calculateReadabilityScore($content);

        // Update readability score
        $library->update(['readability_score' => $readabilityScore]);

        if ($readabilityScore < 60) {
            $this->recommendations[] = [
                'type' => 'warning',
                'message' => 'Content readability could be improved',
                'priority' => 'medium'
            ];
            $this->score += 5;
        } else {
            $this->score += 10;
        }
    }

    private function calculateReadabilityScore(string $content): int
    {
        if (empty($content)) return 0;

        $sentences = preg_split('/[.!?]+/', $content, -1, PREG_SPLIT_NO_EMPTY);
        $words = str_word_count($content);
        $syllables = $this->countSyllables($content);

        if (count($sentences) == 0 || $words == 0) return 0;

        $avgSentenceLength = $words / count($sentences);
        $avgSyllablesPerWord = $syllables / $words;

        // Flesch Reading Ease Score
        $score = 206.835 - (1.015 * $avgSentenceLength) - (84.6 * $avgSyllablesPerWord);

        return max(0, min(100, round($score)));
    }

    private function countSyllables(string $text): int
    {
        $words = str_word_count(strtolower($text), 1);
        $syllables = 0;

        foreach ($words as $word) {
            $syllables += max(1, preg_match_all('/[aeiouy]+/', $word));
        }

        return $syllables;
    }

    private function getGrade(int $score): string
    {
        if ($score >= 90) return 'A+';
        if ($score >= 80) return 'A';
        if ($score >= 70) return 'B';
        if ($score >= 60) return 'C';
        if ($score >= 50) return 'D';
        return 'F';
    }

    public function generateAutoSuggestions(Library $library): array
    {
        $suggestions = [];

        // Auto-generate SEO title if missing
        if (empty($library->seo_title)) {
            $suggestions['seo_title'] = $this->generateSeoTitle($library);
        }

        // Auto-generate meta description if missing
        if (empty($library->meta_description)) {
            $suggestions['meta_description'] = $this->generateMetaDescription($library);
        }

        // Auto-generate structured data
        if (empty($library->structured_data)) {
            $suggestions['structured_data'] = $this->generateStructuredData($library);
        }

        return $suggestions;
    }

    private function generateSeoTitle(Library $library): string
    {
        $title = $library->title;
        $keyword = $library->focus_keyword;

        if ($keyword && stripos($title, $keyword) === false) {
            return $keyword . ' - ' . $title;
        }

        return $title;
    }

    private function generateMetaDescription(Library $library): string
    {
        $description = $library->description;
        $keyword = $library->focus_keyword;

        if (empty($description)) {
            return "Discover {$library->title}" . ($keyword ? " - {$keyword}" : '') . ". Watch engaging video content and explore our comprehensive library.";
        }

        $excerpt = Str::limit(strip_tags($description), 140);

        if ($keyword && stripos($excerpt, $keyword) === false) {
            return $keyword . ' - ' . $excerpt;
        }

        return $excerpt;
    }

    private function generateStructuredData(Library $library): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'VideoObject',
            'name' => $library->title,
            'description' => $library->description ?? '',
            'contentUrl' => $library->video_url,
            'embedUrl' => $library->video_url,
            'uploadDate' => $library->created_at->toISOString(),
            'thumbnailUrl' => $library->logo ? asset('storage/' . $library->logo) : null,
            'keywords' => implode(', ', $library->keywords ?? []),
        ];
    }
}
