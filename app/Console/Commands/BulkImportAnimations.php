<?php

namespace App\Console\Commands;

use App\Services\ApiImportService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class BulkImportAnimations extends Command
{
    protected $signature = 'animations:bulk-import {file}';
    
    protected $description = 'Bulk import animations from a JSON file';

    public function __construct(private ApiImportService $importService)
    {
        parent::__construct();
    }

    public function handle()
    {
        $filePath = $this->argument('file');
        
        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info('Reading JSON file...');
        
        $jsonContent = file_get_contents($filePath);
        $data = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON format: ' . json_last_error_msg());
            return 1;
        }

        $animations = $data['animations'] ?? $data;
        
        if (empty($animations) || !is_array($animations)) {
            $this->error('No animations found in JSON file');
            return 1;
        }

        $total = count($animations);
        $this->info("Found {$total} animations to import");

        if (!$this->confirm('Do you want to continue?', true)) {
            $this->info('Import cancelled');
            return 0;
        }

        $this->info('Starting import...');
        
        $progressBar = $this->output->createProgressBar($total);
        $progressBar->start();

        $stats = [
            'imported' => 0,
            'updated' => 0,
            'errors' => 0,
            'failed_items' => []
        ];

        foreach ($animations as $animation) {
            try {
                $result = $this->importService->processSingleLibraryItem($animation);
                
                if ($result['action'] === 'created') {
                    $stats['imported']++;
                } elseif ($result['action'] === 'updated') {
                    $stats['updated']++;
                }
                
            } catch (\Exception $e) {
                $stats['errors']++;
                $stats['failed_items'][] = [
                    'id' => $animation['id'] ?? 'unknown',
                    'title' => $animation['title'] ?? 'unknown',
                    'error' => $e->getMessage()
                ];
            }
            
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $this->info('Import completed!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total', $total],
                ['Imported (New)', $stats['imported']],
                ['Updated', $stats['updated']],
                ['Errors', $stats['errors']],
            ]
        );

        // Save failed items if any
        if (!empty($stats['failed_items'])) {
            $failedFile = storage_path('app/failed_imports_' . now()->format('Y-m-d_H-i-s') . '.json');
            file_put_contents($failedFile, json_encode($stats['failed_items'], JSON_PRETTY_PRINT));
            $this->warn("Failed items saved to: {$failedFile}");
            
            // Show first 5 errors
            $this->warn("\nFirst errors:");
            foreach (array_slice($stats['failed_items'], 0, 5) as $item) {
                $this->line("  - ID: {$item['id']}, Title: {$item['title']}");
                $this->line("    Error: {$item['error']}");
            }
            
            if (count($stats['failed_items']) > 5) {
                $this->line("  ... and " . (count($stats['failed_items']) - 5) . " more (check the file)");
            }
        }

        return 0;
    }
}