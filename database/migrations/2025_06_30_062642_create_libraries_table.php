<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libraries', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->nullable()->index(); // For API import tracking
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('url')->nullable();
            $table->text('video_url'); // Main video URL
            $table->text('description')->nullable();
            $table->string('logo')->nullable();

            // SEO Fields
            $table->string('seo_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('focus_keyword')->nullable();
            $table->json('keywords')->nullable(); // Array of keywords
            $table->text('canonical_url')->nullable();
            $table->json('structured_data')->nullable();
            $table->integer('seo_score')->default(0);

            // Status
            $table->boolean('is_active')->default(true);
            $table->enum('source', ['api', 'manual'])->default('manual');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libraries');
    }
};
