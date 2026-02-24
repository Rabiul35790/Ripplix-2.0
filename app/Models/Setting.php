<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'settings'; // Table name remains 'settings'

    // Accessor to get full logo URL


    protected $fillable = [
        'logo',
        'favicon',
        'authentication_page_image',
        'hero_image',
        'site_name',
        'site_description',
        'copyright_text',
        'emails',
        'phones',
        'addresses',
        'social_media',
        'seo_settings',
        'google_ads_enabled',
        'google_adsense_client',
        'google_ads_slot_sidebar',
        'google_ads_slot_home',
        'google_ads_slot_modal',
        'google_ads_slot_in_feed',
        'maintenance_mode',
        'maintenance_message',
    ];

    protected $casts = [
        'social_media' => 'array',
        'emails' => 'array',
        'phones' => 'array',
        'addresses' => 'array',
        'seo_settings' => 'array',
        'google_ads_enabled' => 'boolean',
        'maintenance_mode' => 'boolean',
    ];

    /**
     * Get the settings instance (singleton pattern)
     */
    public static function getInstance()
    {
        $settings = static::first();

        if (!$settings) {
            $settings = static::create([
                'site_name' => 'My Website',
                'copyright_text' => '© 2025 My Website. All rights reserved.',
                'emails' => [],
                'phones' => [],
                'addresses' => [],
                'social_media' => [],
                'seo_settings' => [],
                'google_ads_enabled' => false,
            ]);
        }

        return $settings;
    }

    /**
     * Get social media links as array
     */
    public function getSocialMediaAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    /**
     * Set social media links
     */
    public function setSocialMediaAttribute($value)
    {
        $this->attributes['social_media'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get emails as array
     */
    public function getEmailsAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    /**
     * Set emails
     */
    public function setEmailsAttribute($value)
    {
        $this->attributes['emails'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get phones as array
     */
    public function getPhonesAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    /**
     * Set phones
     */
    public function setPhonesAttribute($value)
    {
        $this->attributes['phones'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get addresses as array
     */
    public function getAddressesAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    /**
     * Set addresses
     */
    public function setAddressesAttribute($value)
    {
        $this->attributes['addresses'] = is_array($value) ? json_encode($value) : $value;
    }

     public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    public function getAuthImageUrlAttribute()
    {
        return $this->authentication_page_image ? asset('storage/' . $this->authentication_page_image ) : null;
    }

    public function getHeroImageUrlAttribute()
    {
        return $this->hero_image ? asset('storage/' . $this->hero_image ) : null;
    }

    // public function getCopyrightAttribute()
    // {
    //     return $this->copyright_text ? $this->copyright_text : null;
    // }
}
