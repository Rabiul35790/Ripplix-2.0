<?php

namespace App\Filament\Resources\BackupResource\Pages;

use App\Filament\Resources\BackupResource;
use App\Filament\Widgets\BackupStatsWidget;
use App\Services\BackupService;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListBackups extends ListRecords
{
    protected static string $resource = BackupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Actions are now in the table header
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            BackupStatsWidget::class,
        ];
    }
}
