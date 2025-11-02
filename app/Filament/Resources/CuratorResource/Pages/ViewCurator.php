<?php

namespace App\Filament\Resources\CuratorResource\Pages;

use App\Filament\Resources\CuratorResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCurator extends ViewRecord
{
    protected static string $resource = CuratorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
