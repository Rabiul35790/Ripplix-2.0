<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Stripe, SSLCommerz
            $table->string('slug')->unique(); // stripe, sslcommerz
            $table->text('publishable_key')->nullable();
            $table->text('secret_key');
            $table->enum('mode', ['test', 'live'])->default('test');
            $table->boolean('is_active')->default(false);
            $table->json('config')->nullable(); // Additional gateway-specific config
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_gateways');
    }
};
