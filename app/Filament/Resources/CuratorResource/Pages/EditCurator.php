<?php

namespace App\Filament\Resources\CuratorResource\Pages;

use App\Filament\Resources\CuratorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCurator extends EditRecord
{
    protected static string $resource = CuratorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'Curator updated successfully';
    }
}
