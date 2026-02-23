<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_period', ['free', 'monthly', 'yearly', 'lifetime'])->default('free');
            $table->string('stripe_price_id')->nullable();
            $table->json('features')->nullable();
            $table->integer('max_boards')->default(3);
            $table->integer('max_libraries_per_board')->default(6);
            $table->boolean('can_share')->default(false);
            $table->integer('daily_previews')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
