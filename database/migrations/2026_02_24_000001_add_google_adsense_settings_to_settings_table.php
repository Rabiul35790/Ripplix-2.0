<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('google_ads_enabled')->default(false)->after('seo_settings');
            $table->string('google_adsense_client')->nullable()->after('google_ads_enabled');
            $table->string('google_ads_slot_sidebar')->nullable()->after('google_adsense_client');
            $table->string('google_ads_slot_home')->nullable()->after('google_ads_slot_sidebar');
            $table->string('google_ads_slot_modal')->nullable()->after('google_ads_slot_home');
            $table->string('google_ads_slot_in_feed')->nullable()->after('google_ads_slot_modal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'google_ads_enabled',
                'google_adsense_client',
                'google_ads_slot_sidebar',
                'google_ads_slot_home',
                'google_ads_slot_modal',
                'google_ads_slot_in_feed',
            ]);
        });
    }
};

