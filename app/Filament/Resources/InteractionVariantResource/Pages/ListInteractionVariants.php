<?php

namespace App\Filament\Resources\InteractionVariantResource\Pages;

use App\Filament\Resources\InteractionVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListInteractionVariants extends ListRecords
{
    protected static string $resource = InteractionVariantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
