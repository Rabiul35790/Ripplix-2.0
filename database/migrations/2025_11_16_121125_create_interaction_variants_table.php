<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interaction_variants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot table for interaction-variant relationship
        Schema::create('interaction_interaction_variant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('interaction_variant_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interaction_interaction_variant');
        Schema::dropIfExists('interaction_variants');
    }
};
