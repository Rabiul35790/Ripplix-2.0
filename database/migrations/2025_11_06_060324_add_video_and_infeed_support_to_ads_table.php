<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            // Add media_type column to distinguish between image and video
            $table->enum('media_type', ['image', 'video'])->default('image')->after('image');

            // Add video column for video uploads
            $table->string('video')->nullable()->after('media_type');

            // Add in-feed specific fields
            $table->string('in_feed_name')->nullable()->after('position');
            $table->string('in_feed_link')->nullable()->after('in_feed_name');
        });

        // Update the position enum to include 'in-feed'
        // Note: Laravel doesn't support modifying enums directly, so we use raw SQL
        DB::statement("ALTER TABLE ads MODIFY COLUMN position ENUM('modal', 'sidebar', 'home', 'in-feed') DEFAULT 'sidebar'");

        // Make image column nullable
        Schema::table('ads', function (Blueprint $table) {
            $table->string('image')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'video', 'in_feed_name', 'in_feed_link']);
        });

        // Revert position enum back to original values
        DB::statement("ALTER TABLE ads MODIFY COLUMN position ENUM('modal', 'sidebar', 'home') DEFAULT 'sidebar'");

        // Make image not nullable again
        Schema::table('ads', function (Blueprint $table) {
            $table->string('image')->nullable(false)->change();
        });
    }
};
