<?php

namespace App\Filament\Resources\IndustryVariantResource\Pages;

use App\Filament\Resources\IndustryVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditIndustryVariant extends EditRecord
{
    protected static string $resource = IndustryVariantResource::class;

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
