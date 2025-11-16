<?php

// CreateInteractionVariant.php
namespace App\Filament\Resources\InteractionVariantResource\Pages;

use App\Filament\Resources\InteractionVariantResource;
use Filament\Resources\Pages\CreateRecord;

class CreateInteractionVariant extends CreateRecord
{
    protected static string $resource = InteractionVariantResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
