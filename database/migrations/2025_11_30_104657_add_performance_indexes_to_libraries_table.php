<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::table('categories', function (Blueprint $table) {
            $table->index('is_top');
            $table->index('is_active');
            $table->index('slug');
        });

        Schema::table('industries', function (Blueprint $table) {
            $table->index('is_top');
            $table->index('is_active');
            $table->index('slug');
        });

        Schema::table('interactions', function (Blueprint $table) {
            $table->index('is_top');
            $table->index('is_active');
            $table->index('slug');
        });
    }

    public function down(): void
    {

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['is_top']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['slug']);
        });

        Schema::table('industries', function (Blueprint $table) {
            $table->dropIndex(['is_top']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['slug']);
        });

        Schema::table('interactions', function (Blueprint $table) {
            $table->dropIndex(['is_top']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['slug']);
        });
    }
};
