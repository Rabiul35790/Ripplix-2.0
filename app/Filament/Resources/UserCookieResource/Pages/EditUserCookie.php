<?php

namespace App\Filament\Resources\UserCookieResource\Pages;

use App\Filament\Resources\UserCookieResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUserCookie extends EditRecord
{
    protected static string $resource = UserCookieResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
