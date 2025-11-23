<?php

namespace App\Console\Commands;

use App\Models\Library;
use Illuminate\Console\Command;

class FixKeywordsFormat extends Command
{
    protected $signature = 'library:fix-keywords';
    protected $description = 'Fix keywords format from comma-separated string to JSON array';

    public function handle()
    {
        $this->info('Starting to fix keywords format...');

        $libraries = Library::whereNotNull('keywords')
            ->get();

        $fixed = 0;

        foreach ($libraries as $library) {
            $keywords = $library->getAttributes()['keywords']; // Get raw value

            // Check if it's a string that's not JSON
            if (is_string($keywords) && !str_starts_with($keywords, '[')) {
                // Split by comma and clean
                $keywordsArray = array_filter(array_map('trim', explode(',', $keywords)));

                // Update using the model (which will trigger the mutator)
                $library->keywords = $keywordsArray;
                $library->save();

                $fixed++;
                $this->line("Fixed: {$library->title}");
            }
        }

        $this->info("Fixed {$fixed} records.");

        return 0;
    }
}
