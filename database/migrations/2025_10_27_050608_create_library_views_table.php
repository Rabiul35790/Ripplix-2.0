<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('session_id')->nullable(); // For unauthenticated users
            $table->timestamp('viewed_at');
            $table->timestamps();

            // Indexes for better performance
            $table->index(['library_id', 'user_id']);
            $table->index(['library_id', 'session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_views');
    }
};
