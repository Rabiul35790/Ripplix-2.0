<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('libraries', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('created_at');
            $table->index(['is_active', 'created_at']); // Composite index
        });

        // Add indexes to pivot tables
        Schema::table('category_library', function (Blueprint $table) {
            $table->index('library_id');
            $table->index('category_id');
        });

        Schema::table('industry_library', function (Blueprint $table) {
            $table->index('library_id');
            $table->index('industry_id');
        });

        Schema::table('interaction_library', function (Blueprint $table) {
            $table->index('library_id');
            $table->index('interaction_id');
        });

        Schema::table('library_platform', function (Blueprint $table) {
            $table->index('library_id');
            $table->index('platform_id');
        });
    }

    public function down()
    {
        Schema::table('libraries', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['is_active', 'created_at']);
        });

        Schema::table('category_library', function (Blueprint $table) {
            $table->dropIndex(['library_id']);
            $table->dropIndex(['category_id']);
        });

        Schema::table('industry_library', function (Blueprint $table) {
            $table->dropIndex(['library_id']);
            $table->dropIndex(['industry_id']);
        });

        Schema::table('interaction_library', function (Blueprint $table) {
            $table->dropIndex(['library_id']);
            $table->dropIndex(['interaction_id']);
        });

        Schema::table('library_platform', function (Blueprint $table) {
            $table->dropIndex(['library_id']);
            $table->dropIndex(['platform_id']);
        });
    }
};
