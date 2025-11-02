<?php

namespace App\Filament\Resources\ContactResource\Pages;

use App\Filament\Resources\ContactResource;
use Filament\Resources\Pages\ListRecords;

class ListContacts extends ListRecords
{
    protected static string $resource = ContactResource::class;

    public function getTitle(): string
    {
        return 'Contact Messages';
    }

    protected function getHeaderActions(): array
    {
        return [
            // No create action needed as contacts are created from frontend
        ];
    }
}
