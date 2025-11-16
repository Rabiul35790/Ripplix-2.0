<?php

namespace App\Filament\Resources\CategoryVariantResource\Pages;

use App\Filament\Resources\CategoryVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCategoryVariant extends ViewRecord
{
    protected static string $resource = CategoryVariantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
