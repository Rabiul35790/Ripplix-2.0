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

        // Clean up SEO settings profiles
        if (isset($data['seo_settings'])) {
            $seoProfiles = [];

            foreach ($data['seo_settings'] as $profile) {
                $pageKey = $profile['page_key'] ?? null;
                $customPageKey = trim($profile['custom_page_key'] ?? '');

                if ($pageKey === 'custom' && $customPageKey !== '') {
                    $pageKey = $customPageKey;
                }

                if (!$pageKey) {
                    continue;
                }

                $seoProfiles[] = [
                    'page_key' => $pageKey,
                    'title' => trim($profile['title'] ?? ''),
                    'description' => trim($profile['description'] ?? ''),
                    'canonical_url' => trim($profile['canonical_url'] ?? ''),
                    'og_title' => trim($profile['og_title'] ?? ''),
                    'og_description' => trim($profile['og_description'] ?? ''),
                    'og_image' => trim($profile['og_image'] ?? ''),
                    'og_type' => trim($profile['og_type'] ?? 'website'),
                    'og_url' => trim($profile['og_url'] ?? ''),
                    'og_site_name' => trim($profile['og_site_name'] ?? ''),
                    'twitter_card' => trim($profile['twitter_card'] ?? 'summary_large_image'),
                    'twitter_url' => trim($profile['twitter_url'] ?? ''),
                    'twitter_title' => trim($profile['twitter_title'] ?? ''),
                    'twitter_description' => trim($profile['twitter_description'] ?? ''),
                    'twitter_image' => trim($profile['twitter_image'] ?? ''),
                    'structured_data' => (function () use ($profile) {
                        $structuredData = trim((string) ($profile['structured_data'] ?? ''));
                        if ($structuredData === '') {
                            return '';
                        }

                        $decoded = json_decode($structuredData, true);
                        return json_last_error() === JSON_ERROR_NONE
                            ? json_encode($decoded, JSON_UNESCAPED_SLASHES)
                            : $structuredData;
                    })(),
                    'notes' => trim($profile['notes'] ?? ''),
                ];
            }

            $data['seo_settings'] = $seoProfiles;
        }

        if (isset($data['google_adsense_client'])) {
            $data['google_adsense_client'] = trim((string) $data['google_adsense_client']);
        }

        foreach (['sidebar', 'home', 'modal', 'in_feed'] as $placement) {
            $key = "google_ads_slot_{$placement}";
            if (isset($data[$key])) {
                $data[$key] = trim((string) $data[$key]);
            }
        }

        return $data;
    }
}
