<?php

namespace App\Filament\Widgets;

use App\Services\BackupService;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class BackupStatsWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected function getStats(): array
    {
        $service = app(BackupService::class);
        $stats = $service->getBackupStatistics();

        $totalSize = $stats['total_size'];
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($totalSize >= 1024 && $i < count($units) - 1) {
            $totalSize /= 1024;
            $i++;
        }
        $formattedSize = round($totalSize, 2) . ' ' . $units[$i];

        return [

            Stat::make('Total Backups', $stats['total_backups'])
                ->description('All backup records')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('primary'),

            Stat::make('Completed Backups', $stats['completed_backups'])
                ->description('Successfully completed')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),

            Stat::make('Failed Backups', $stats['failed_backups'])
                ->description('Failed to complete')
                ->descriptionIcon('heroicon-m-x-circle')
                ->color('danger'),

            Stat::make('Total Storage Used', $formattedSize)
                ->description('Disk space used')
                ->descriptionIcon('heroicon-m-circle-stack')
                ->color('warning'),

            Stat::make('Last Backup', $stats['last_backup'] ? $stats['last_backup']->diffForHumans() : 'Never')
                ->description('Most recent backup')
                ->descriptionIcon('heroicon-m-clock')
                ->color('info'),
        ];
    }

    protected function getHeading(): ?string
    {
        return 'Backup Statistics';
    }



    // protected function getColumns(): int
    // {
    //     return 5;
    // }
}
