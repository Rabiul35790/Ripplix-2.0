<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('libraries', function (Blueprint $table) {
            // Advanced SEO fields
            $table->string('og_title')->nullable()->after('meta_description');
            $table->text('og_description')->nullable()->after('og_title');
            $table->string('og_image')->nullable()->after('og_description');
            $table->string('og_type')->default('article')->after('og_image');

            // Content analysis
            $table->integer('content_length')->default(0)->after('seo_score');
            $table->integer('readability_score')->default(0)->after('content_length');
            $table->json('seo_recommendations')->nullable()->after('readability_score');

            // Performance tracking
            $table->timestamp('last_seo_check')->nullable()->after('seo_recommendations');
            $table->json('seo_history')->nullable()->after('last_seo_check');

            // Schema markup
            $table->string('schema_type')->default('VideoObject')->after('seo_history');
            $table->json('breadcrumbs')->nullable()->after('schema_type');

            // Indexing control
            $table->boolean('index_follow')->default(true)->after('breadcrumbs');
            $table->string('robots_meta')->default('index,follow')->after('index_follow');
        });
    }

    public function down(): void
    {
        Schema::table('libraries', function (Blueprint $table) {
            $table->dropColumn([
                'og_title', 'og_description', 'og_image', 'og_type',
                'content_length', 'readability_score', 'seo_recommendations',
                'last_seo_check', 'seo_history', 'schema_type', 'breadcrumbs',
                'index_follow', 'robots_meta'
            ]);
        });
    }
};
