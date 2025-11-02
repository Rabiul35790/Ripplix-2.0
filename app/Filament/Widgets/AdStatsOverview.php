<?php
// app/Filament/Resources/AdResource/Widgets/AdStatsOverview.php

namespace App\Filament\Widgets;

use App\Models\Ad;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdStatsOverview extends BaseWidget
{
    protected static ?int $sort = 2;
    protected function getStats(): array
    {
        $totalAds = Ad::count();
        $activeAds = Ad::active()->count();
        $totalClicks = Ad::sum('clicks');
        $sidebarAds = Ad::sidebar()->active()->count();
        $modalAds = Ad::modal()->active()->count();
        $homeAds = Ad::home()->active()->count();

        return [
            Stat::make('Total Advertisements', $totalAds)
                ->description('All advertisements in system')
                ->descriptionIcon('heroicon-m-megaphone')
                ->color('primary'),

            Stat::make('Active Advertisements', $activeAds)
                ->description('Currently running ads')
                ->descriptionIcon('heroicon-m-play-circle')
                ->color('success'),

            Stat::make('Total Clicks', number_format($totalClicks))
                ->description('All time ad clicks')
                ->descriptionIcon('heroicon-m-cursor-arrow-rays')
                ->color('warning'),

            Stat::make('Sidebar Ads Active', $sidebarAds)
                ->description('Active sidebar advertisements')
                ->descriptionIcon('heroicon-m-bars-3-center-left')
                ->color('info'),

            Stat::make('Details Page Ads Active', $modalAds)
                ->description('Active details page advertisements')
                ->descriptionIcon('heroicon-m-window')
                ->color('info'),
            Stat::make('Home Page Ads Active', $homeAds)
                ->description('Active home page advertisements')
                ->descriptionIcon('heroicon-m-home')
                ->color('info'),
        ];
    }

    Protected function getHeading(): string|null {
        return 'Advertisement Statistics';
    }
}
