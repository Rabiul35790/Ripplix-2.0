<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Library-Category relationship (note the alphabetical order: category_library)
        Schema::create('category_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Library-Industry relationship (note the alphabetical order: industry_library)
        Schema::create('industry_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_id')->constrained()->onDelete('cascade');
            $table->foreignId('industry_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Library-Interaction relationship (note the alphabetical order: interaction_library)
        Schema::create('interaction_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_id')->constrained()->onDelete('cascade');
            $table->foreignId('interaction_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Library-Platform relationship (note the alphabetical order: library_platform - this one is correct)
        Schema::create('library_platform', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_id')->constrained()->onDelete('cascade');
            $table->foreignId('platform_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interaction_library');
        Schema::dropIfExists('industry_library');
        Schema::dropIfExists('library_platform');
        Schema::dropIfExists('category_library');
    }
};
