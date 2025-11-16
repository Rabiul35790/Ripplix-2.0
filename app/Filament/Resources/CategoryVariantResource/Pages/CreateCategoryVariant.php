<?php

namespace App\Filament\Resources\CategoryVariantResource\Pages;

use App\Filament\Resources\CategoryVariantResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCategoryVariant extends CreateRecord
{
    protected static string $resource = CategoryVariantResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
