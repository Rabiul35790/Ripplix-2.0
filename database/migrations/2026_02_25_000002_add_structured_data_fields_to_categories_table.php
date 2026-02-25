<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'schema_type')) {
                $table->string('schema_type')->nullable();
            }

            if (!Schema::hasColumn('categories', 'structured_data')) {
                $table->json('structured_data')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'structured_data')) {
                $table->dropColumn('structured_data');
            }

            if (Schema::hasColumn('categories', 'schema_type')) {
                $table->dropColumn('schema_type');
            }
        });
    }
};

