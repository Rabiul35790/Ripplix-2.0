<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_period', ['monthly', 'yearly', 'lifetime', 'free'])->default('monthly');
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');

            // Plan features
            $table->text('grid_list_visibility')->nullable();
            $table->string('daily_previews')->nullable();
            $table->string('boards_create')->nullable();
            $table->boolean('board_sharing')->default(false);
            $table->boolean('ads')->default(true);
            $table->text('extras')->nullable();

            // Plan settings
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);

            // Student discount
            $table->integer('student_discount_percentage')->nullable();
            $table->boolean('student_verification_required')->default(false);

            // Content
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->string('button_text')->default('Choose Plan');
            $table->string('button_color')->default('#3B82F6');
            $table->string('highlight_color')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'sort_order']);
            $table->index('billing_period');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_plans');
    }
};
