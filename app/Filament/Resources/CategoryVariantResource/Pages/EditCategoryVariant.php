<?php

namespace App\Filament\Resources\CategoryVariantResource\Pages;

use App\Filament\Resources\CategoryVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCategoryVariant extends EditRecord
{
    protected static string $resource = CategoryVariantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
