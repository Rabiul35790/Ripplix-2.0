<?php
// database/migrations/xxxx_xx_xx_add_pricing_plan_id_to_users_table.php

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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('pricing_plan_id')->nullable()->after('is_active');
            $table->foreign('pricing_plan_id')->references('id')->on('pricing_plans')->onDelete('set null');
            $table->index('pricing_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['pricing_plan_id']);
            $table->dropIndex(['pricing_plan_id']);
            $table->dropColumn('pricing_plan_id');
        });
    }
};
