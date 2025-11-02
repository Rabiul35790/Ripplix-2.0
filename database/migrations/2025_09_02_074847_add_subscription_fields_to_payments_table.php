<?php

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
        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('subscription_start_date')->nullable()->after('paid_at');
            $table->timestamp('subscription_end_date')->nullable()->after('subscription_start_date');
            $table->boolean('is_renewal')->default(false)->after('subscription_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['subscription_start_date', 'subscription_end_date', 'is_renewal']);
        });
    }
};
