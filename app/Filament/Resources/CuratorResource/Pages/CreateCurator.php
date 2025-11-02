<?php

namespace App\Filament\Resources\CuratorResource\Pages;

use App\Filament\Resources\CuratorResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateCurator extends CreateRecord
{
    protected static string $resource = CuratorResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Curator created successfully';
    }
}
