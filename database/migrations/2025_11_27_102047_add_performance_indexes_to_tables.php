<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Index for faster user plan lookups
        if (!$this->indexExists('users', 'users_pricing_plan_id_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('pricing_plan_id');
            });
        }

        // Composite index for expired subscriptions query
        if (!$this->indexExists('users', 'users_plan_expires_at_pricing_plan_id_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index(['plan_expires_at', 'pricing_plan_id']);
            });
        }

        // Index for faster board-user relationship queries
        if (!$this->indexExists('boards', 'boards_user_id_index')) {
            Schema::table('boards', function (Blueprint $table) {
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if ($this->indexExists('users', 'users_pricing_plan_id_index')) {
                $table->dropIndex('users_pricing_plan_id_index');
            }
            if ($this->indexExists('users', 'users_plan_expires_at_pricing_plan_id_index')) {
                $table->dropIndex('users_plan_expires_at_pricing_plan_id_index');
            }
        });

        Schema::table('boards', function (Blueprint $table) {
            if ($this->indexExists('boards', 'boards_user_id_index')) {
                $table->dropIndex('boards_user_id_index');
            }
        });
    }

    /**
     * Check if an index exists (MySQL)
     */
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();

        $result = DB::select(
            "SELECT COUNT(*) as count
             FROM information_schema.statistics
             WHERE table_schema = ?
             AND table_name = ?
             AND index_name = ?",
            [$database, $table, $index]
        );

        return $result[0]->count > 0;
    }
};
