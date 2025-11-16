<?php

namespace App\Filament\Resources\InteractionVariantResource\Pages;

use App\Filament\Resources\InteractionVariantResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditInteractionVariant extends EditRecord
{
    protected static string $resource = InteractionVariantResource::class;

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
