<?php

namespace App\Filament\Resources\CategoryVariantResource\Pages;

use App\Filament\Resources\CategoryVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCategoryVariants extends ListRecords
{
    protected static string $resource = CategoryVariantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
