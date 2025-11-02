<?php

namespace App\Services;

use App\Models\Library;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Illuminate\Support\Facades\Storage;

class SitemapService
{
    public function generate(): void
    {
        $sitemap = Sitemap::create();

        // Add homepage
        $sitemap->add(
            Url::create('/')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(1.0)
        );

        // Add libraries
        Library::query()
            ->where('is_active', true)
            ->where('index_follow', true)
            ->orderBy('updated_at', 'desc')
            ->chunk(100, function ($libraries) use ($sitemap) {
                foreach ($libraries as $library) {
                    $sitemap->add(
                        Url::create(route('libraries.show', $library->slug))
                            ->setLastModificationDate($library->updated_at)
                            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                            ->setPriority(0.8)
                    );
                }
            });

        // Add category pages
        $categories = \App\Models\Category::query()
            ->whereHas('libraries', function ($query) {
                $query->where('is_active', true);
            })
            ->get();

        foreach ($categories as $category) {
            $sitemap->add(
                Url::create(route('libraries.category', $category->slug))
                    ->setLastModificationDate($category->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.7)
            );
        }

        // Add platform pages
        $platforms = \App\Models\Platform::query()
            ->whereHas('libraries', function ($query) {
                $query->where('is_active', true);
            })
            ->get();

        foreach ($platforms as $platform) {
            $sitemap->add(
                Url::create(route('libraries.platform', $platform->slug))
                    ->setLastModificationDate($platform->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.6)
            );
        }

        // Save sitemap
        $sitemap->writeToFile(public_path('sitemap.xml'));
    }

    public function generateVideoSitemap(): void
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">' . "\n";

        Library::query()
            ->where('is_active', true)
            ->where('index_follow', true)
            ->whereNotNull('video_url')
            ->orderBy('updated_at', 'desc')
            ->chunk(100, function ($libraries) use (&$xml) {
                foreach ($libraries as $library) {
                    $xml .= "  <url>\n";
                    $xml .= "    <loc>" . route('libraries.show', $library->slug) . "</loc>\n";
                    $xml .= "    <lastmod>" . $library->updated_at->toISOString() . "</lastmod>\n";
                    $xml .= "    <video:video>\n";
                    $xml .= "      <video:thumbnail_loc>" . ($library->logo ? asset('storage/' . $library->logo) : '') . "</video:thumbnail_loc>\n";
                    $xml .= "      <video:title><![CDATA[" . $library->title . "]]></video:title>\n";
                    $xml .= "      <video:description><![CDATA[" . ($library->description ?? '') . "]]></video:description>\n";
                    $xml .= "      <video:content_loc>" . $library->video_url . "</video:content_loc>\n";
                    $xml .= "      <video:publication_date>" . $library->created_at->toISOString() . "</video:publication_date>\n";

                    if ($library->keywords) {
                        $xml .= "      <video:tag>" . implode(', ', $library->keywords) . "</video:tag>\n";
                    }

                    $xml .= "    </video:video>\n";
                    $xml .= "  </url>\n";
                }
            });

        $xml .= '</urlset>';

        Storage::disk('public')->put('../sitemap-video.xml', $xml);
    }

    public function generateNewsSitemap(): void
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . "\n";

        // Get recent libraries (last 2 days for news sitemap)
        Library::query()
            ->where('is_active', true)
            ->where('index_follow', true)
            ->where('created_at', '>=', now()->subDays(2))
            ->orderBy('created_at', 'desc')
            ->chunk(100, function ($libraries) use (&$xml) {
                foreach ($libraries as $library) {
                    $xml .= "  <url>\n";
                    $xml .= "    <loc>" . route('libraries.show', $library->slug) . "</loc>\n";
                    $xml .= "    <news:news>\n";
                    $xml .= "      <news:publication>\n";
                    $xml .= "        <news:name>" . config('app.name') . "</news:name>\n";
                    $xml .= "        <news:language>en</news:language>\n";
                    $xml .= "      </news:publication>\n";
                    $xml .= "      <news:publication_date>" . $library->created_at->toISOString() . "</news:publication_date>\n";
                    $xml .= "      <news:title><![CDATA[" . $library->title . "]]></news:title>\n";
                    $xml .= "      <news:keywords>" . implode(', ', $library->keywords ?? []) . "</news:keywords>\n";
                    $xml .= "    </news:news>\n";
                    $xml .= "  </url>\n";
                }
            });

        $xml .= '</urlset>';

        Storage::disk('public')->put('../sitemap-news.xml', $xml);
    }

    public function generateSitemapIndex(): void
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Main sitemap
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>" . url('sitemap.xml') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
        $xml .= "  </sitemap>\n";

        // Video sitemap
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>" . url('sitemap-video.xml') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
        $xml .= "  </sitemap>\n";

        // News sitemap
        $xml .= "  <sitemap>\n";
        $xml .= "    <loc>" . url('sitemap-news.xml') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toISOString() . "</lastmod>\n";
        $xml .= "  </sitemap>\n";

        $xml .= '</sitemapindex>';

        Storage::disk('public')->put('../sitemap-index.xml', $xml);
    }
}
