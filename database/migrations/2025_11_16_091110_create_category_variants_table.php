<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_variants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot table for category-variant relationship
        Schema::create('category_category_variant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_variant_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Add product_url to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->string('product_url')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('product_url');
        });

        Schema::dropIfExists('category_category_variant');
        Schema::dropIfExists('category_variants');
    }
};
