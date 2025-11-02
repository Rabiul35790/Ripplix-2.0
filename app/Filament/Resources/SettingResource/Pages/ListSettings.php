<?php

// File: app/Filament/Resources/SettingResource/Pages/ListSettings.php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use App\Models\Setting;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSettings extends ListRecords
{
    protected static string $resource = SettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Remove create action since we don't want multiple settings
        ];
    }

    public function mount(): void
    {
        parent::mount();

        // Ensure settings record exists
        $settings = Setting::getInstance();

        // Redirect to edit if settings exist
        if ($settings) {
            $this->redirect(SettingResource::getUrl('edit', ['record' => $settings->id]));
        }
    }
}
