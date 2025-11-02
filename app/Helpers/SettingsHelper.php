<?php

// File: app/Helpers/SettingsHelper.php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsHelper
{
    /**
     * Get settings with caching
     */
    public static function get(string $key = null, $default = null)
    {
        $settings = Cache::remember('site_settings', 3600, function () {
            return Setting::getInstance();
        });

        if ($key) {
            return data_get($settings, $key, $default);
        }

        return $settings;
    }

    /**
     * Clear settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget('site_settings');
    }

    /**
     * Get site logo URL
     */
    public static function logo(): ?string
    {
        $logo = self::get('logo');
        return $logo ? asset('storage/' . $logo) : null;
    }

    // public static function copyright_text(): ?string
    // {
    //     return self::get('copyright_text');
    // }

    /**
     * Get favicon URL
     */
    public static function favicon(): ?string
    {
        $favicon = self::get('favicon');
        return $favicon ? asset('storage/' . $favicon) : null;
    }

    /**
     * Get social media links
     */
    public static function socialMedia(): array
    {
        return self::get('social_media', []);
    }

    /**
     * Get emails
     */
    public static function emails(): array
    {
        return self::get('emails', []);
    }

    /**
     * Get primary email
     */
    public static function primaryEmail(): ?string
    {
        $emails = self::emails();
        return !empty($emails) ? $emails[0]['email'] : null;
    }

    /**
     * Get email by type
     */
    public static function emailByType(string $type): ?string
    {
        $emails = self::emails();
        foreach ($emails as $email) {
            if ($email['type'] === $type) {
                return $email['email'];
            }
        }
        return null;
    }

    /**
     * Get phones
     */
    public static function phones(): array
    {
        return self::get('phones', []);
    }

    /**
     * Get primary phone
     */
    public static function primaryPhone(): ?string
    {
        $phones = self::phones();
        return !empty($phones) ? $phones[0]['number'] : null;
    }

    /**
     * Get phone by type
     */
    public static function phoneByType(string $type): ?string
    {
        $phones = self::phones();
        foreach ($phones as $phone) {
            if ($phone['type'] === $type) {
                return $phone['number'];
            }
        }
        return null;
    }

    /**
     * Get addresses
     */
    public static function addresses(): array
    {
        return self::get('addresses', []);
    }

    /**
     * Get primary address
     */
    public static function primaryAddress(): ?string
    {
        $addresses = self::addresses();
        return !empty($addresses) ? $addresses[0]['address'] : null;
    }

    /**
     * Get address by type
     */
    public static function addressByType(string $type): ?string
    {
        $addresses = self::addresses();
        foreach ($addresses as $address) {
            if ($address['type'] === $type) {
                return $address['address'];
            }
        }
        return null;
    }

    /**
     * Check if maintenance mode is enabled
     */
    public static function isMaintenanceMode(): bool
    {
        return self::get('maintenance_mode', false);
    }

    /**
     * Get maintenance message
     */
    public static function maintenanceMessage(): string
    {
        return self::get('maintenance_message', 'We are currently performing scheduled maintenance. Please check back soon.');
    }
}
