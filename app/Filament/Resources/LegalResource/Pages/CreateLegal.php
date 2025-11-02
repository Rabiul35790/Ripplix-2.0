<?php

// app/Filament/Resources/LegalResource/Pages/CreateLegal.php

namespace App\Filament\Resources\LegalResource\Pages;

use App\Filament\Resources\LegalResource;
use Filament\Resources\Pages\CreateRecord;
use Filament\Notifications\Notification;

class CreateLegal extends CreateRecord
{
    protected static string $resource = LegalResource::class;

    public function getTitle(): string
    {
        return 'Create Legal Document';
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getCreatedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Legal document created')
            ->body('The legal document has been created successfully.');
    }
}
