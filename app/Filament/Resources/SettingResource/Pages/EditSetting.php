<?php

// File: app/Filament/Resources/SettingResource/Pages/EditSetting.php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Notifications\Notification;

class EditSetting extends EditRecord
{
    protected static string $resource = SettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Remove delete action
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getSavedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Settings Updated')
            ->body('Website settings have been successfully updated.')
            ->duration(5000);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Clean up social media data
        if (isset($data['social_media'])) {
            $socialMedia = [];
            foreach ($data['social_media'] as $social) {
                if (!empty($social['url'])) {
                    // Clean URL
                    $url = $social['url'];
                    if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
                        $url = 'https://' . $url;
                    }

                    $socialMedia[] = [
                        'platform' => $social['platform'],
                        'custom_name' => $social['custom_name'] ?? null,
                        'url' => $url,
                    ];
                }
            }
            $data['social_media'] = $socialMedia;
        }

        // Clean up emails data
        if (isset($data['emails'])) {
            $emails = [];
            foreach ($data['emails'] as $email) {
                if (!empty($email['email'])) {
                    $emails[] = [
                        'type' => $email['type'],
                        'custom_label' => $email['custom_label'] ?? null,
                        'email' => strtolower(trim($email['email'])),
                    ];
                }
            }
            $data['emails'] = $emails;
        }

        // Clean up phones data
        if (isset($data['phones'])) {
            $phones = [];
            foreach ($data['phones'] as $phone) {
                if (!empty($phone['number'])) {
                    $phones[] = [
                        'type' => $phone['type'],
                        'custom_label' => $phone['custom_label'] ?? null,
                        'number' => trim($phone['number']),
                    ];
                }
            }
            $data['phones'] = $phones;
        }

        // Clean up addresses data
        if (isset($data['addresses'])) {
            $addresses = [];
            foreach ($data['addresses'] as $address) {
                if (!empty($address['address'])) {
                    $addresses[] = [
                        'type' => $address['type'],
                        'custom_label' => $address['custom_label'] ?? null,
                        'address' => trim($address['address']),
                    ];
                }
            }
            $data['addresses'] = $addresses;
        }

        return $data;
    }
}
