<?php

namespace App\Filament\Resources\IndustryVariantResource\Pages;

use App\Filament\Resources\IndustryVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListIndustryVariants extends ListRecords
{
    protected static string $resource = IndustryVariantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
