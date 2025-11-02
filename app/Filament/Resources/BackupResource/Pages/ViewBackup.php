<?php

namespace App\Filament\Resources\BackupResource\Pages;

use App\Filament\Resources\BackupResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Notifications\Notification;

class ViewBackup extends ViewRecord
{
    protected static string $resource = BackupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('download')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->visible(fn() => $this->record->status === 'completed' && $this->record->exists())
                ->action(function () {
                    try {
                        return $this->record->download();
                    } catch (\Exception $e) {
                        Notification::make()
                            ->title('Download Failed')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Actions\DeleteAction::make()
                ->visible(fn() => auth()->user()->can('delete_backups')),
        ];
    }
}
