<?php

// CreateIndustryVariant.php
namespace App\Filament\Resources\IndustryVariantResource\Pages;

use App\Filament\Resources\IndustryVariantResource;
use Filament\Resources\Pages\CreateRecord;

class CreateIndustryVariant extends CreateRecord
{
    protected static string $resource = IndustryVariantResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
