<?php

namespace App\Console\Commands;

use App\Services\SitemapService;
use Illuminate\Console\Command;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate {--type=all : Type of sitemap to generate (all, main, video, news, index)}';
    protected $description = 'Generate XML sitemaps for better SEO';

    public function handle(): int
    {
        $sitemapService = new SitemapService();
        $type = $this->option('type');

        try {
            $this->info('Generating sitemap(s)...');

            switch ($type) {
                case 'main':
                    $sitemapService->generate();
                    $this->info('Main sitemap generated successfully!');
                    break;

                case 'video':
                    $sitemapService->generateVideoSitemap();
                    $this->info('Video sitemap generated successfully!');
                    break;

                case 'news':
                    $sitemapService->generateNewsSitemap();
                    $this->info('News sitemap generated successfully!');
                    break;

                case 'index':
                    $sitemapService->generateSitemapIndex();
                    $this->info('Sitemap index generated successfully!');
                    break;

                default:
                    $sitemapService->generate();
                    $sitemapService->generateVideoSitemap();
                    $sitemapService->generateNewsSitemap();
                    $sitemapService->generateSitemapIndex();
                    $this->info('All sitemaps generated successfully!');
                    break;
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to generate sitemap: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
