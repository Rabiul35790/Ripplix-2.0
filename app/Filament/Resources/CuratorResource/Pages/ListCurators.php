<?php

namespace App\Filament\Resources\CuratorResource\Pages;

use App\Filament\Resources\CuratorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCurators extends ListRecords
{
    protected static string $resource = CuratorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Add New Curator'),
        ];
    }
}
