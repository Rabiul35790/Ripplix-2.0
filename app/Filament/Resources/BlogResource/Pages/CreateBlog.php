<?php

namespace App\Filament\Resources\BlogResource\Pages;

use App\Filament\Resources\BlogResource;
use Filament\Resources\Pages\CreateRecord;

class CreateBlog extends CreateRecord
{
    protected static string $resource = BlogResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Blog post created successfully';
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Ensure author is set
        if (empty($data['author'])) {
            $data['author'] = auth()->user()->name ?? 'Admin';
        }

        return $data;
    }
}
