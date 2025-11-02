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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('site_name');
            $table->text('site_description')->nullable();
            $table->text('copyright_text')->nullable();
            $table->json('emails')->nullable(); // Store multiple emails as JSON
            $table->json('phones')->nullable(); // Store multiple phones as JSON
            $table->json('addresses')->nullable(); // Store multiple addresses as JSON
            $table->json('social_media')->nullable(); // Store as JSON array
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            'id' => 1,
            'site_name' => 'My Website',
            'emails' => json_encode([]),
            'phones' => json_encode([]),
            'addresses' => json_encode([]),
            'maintenance_mode' => false,
            'social_media' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
