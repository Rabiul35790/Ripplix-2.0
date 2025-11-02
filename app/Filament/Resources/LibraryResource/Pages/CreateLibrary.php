<?php

namespace App\Filament\Resources\LibraryResource\Pages;

use App\Filament\Resources\LibraryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateLibrary extends CreateRecord
{
    protected static string $resource = LibraryResource::class;

    protected function afterCreate(): void
    {
        // Update SEO score after creation
        $this->record->updateSeoScore();
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
