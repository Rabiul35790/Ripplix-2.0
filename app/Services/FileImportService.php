<?php

namespace App\Services;

use App\Models\Library;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use League\Csv\Reader;

class FileImportService
{
    public function __construct(private ApiImportService $apiImportService)
    {
    }

    /**
     * Import from uploaded file (CSV or JSON)
     */
    public function importFromFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        return match ($extension) {
            'csv' => $this->importFromCsv($file),
            'json' => $this->importFromJson($file),
            default => throw new \Exception('Unsupported file type. Only CSV and JSON files are allowed.')
        };
    }

    /**
     * Import from CSV file
     */
    private function importFromCsv(UploadedFile $file): array
    {
        try {
            $csv = Reader::createFromPath($file->getRealPath(), 'r');
            $csv->setHeaderOffset(0);

            $records = iterator_to_array($csv->getRecords());

            return $this->processImportRecords($records);

        } catch (\Exception $e) {
            Log::error('CSV Import failed', ['error' => $e->getMessage()]);
            throw new \Exception('Failed to parse CSV file: ' . $e->getMessage());
        }
    }

    /**
     * Import from JSON file
     */
    private function importFromJson(UploadedFile $file): array
    {
        try {
            $content = file_get_contents($file->getRealPath());
            $data = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON format: ' . json_last_error_msg());
            }

            // Support both wrapped and unwrapped formats
            $records = $data['animations'] ?? $data;

            if (!is_array($records)) {
                throw new \Exception('JSON must contain an array of animations');
            }

            return $this->processImportRecords($records);

        } catch (\Exception $e) {
            Log::error('JSON Import failed', ['error' => $e->getMessage()]);
            throw new \Exception('Failed to parse JSON file: ' . $e->getMessage());
        }
    }

    /**
     * Process and validate import records
     */
    private function processImportRecords(array $records): array
    {
        $importStats = [
            'total' => count($records),
            'imported' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => []
        ];

        foreach ($records as $index => $record) {
            try {
                // Normalize the record
                $normalizedRecord = $this->normalizeRecord($record);

                // Validate the record
                $validator = $this->validateRecord($normalizedRecord);

                if ($validator->fails()) {
                    $importStats['errors'][] = [
                        'row' => $index + 1,
                        'id' => $normalizedRecord['id'] ?? 'N/A',
                        'title' => $normalizedRecord['title'] ?? 'N/A',
                        'error' => 'Validation failed: ' . $validator->errors()->first()
                    ];
                    $importStats['skipped']++;
                    continue;
                }

                // Process the record using existing service
                $result = $this->apiImportService->processSingleLibraryItem($normalizedRecord);

                if ($result['action'] === 'created') {
                    $importStats['imported']++;
                } elseif ($result['action'] === 'updated') {
                    $importStats['updated']++;
                }

            } catch (\Exception $e) {
                $importStats['errors'][] = [
                    'row' => $index + 1,
                    'id' => $record['id'] ?? 'N/A',
                    'title' => $record['title'] ?? 'N/A',
                    'error' => $e->getMessage()
                ];
                $importStats['skipped']++;

                Log::error('File import row error', [
                    'row' => $index + 1,
                    'error' => $e->getMessage(),
                    'record' => $record
                ]);
            }
        }

        return $importStats;
    }

    /**
     * Normalize record to expected format
     */
    private function normalizeRecord(array $record): array
    {
        // Get ID and convert to string if it's a number
        $id = $record['id'] ?? $record['external_id'] ?? null;
        $id = $id !== null ? (string) $id : null;

        return [
            'id' => $id,
            'published_date' => $record['published_date'] ?? null,
            'title' => $record['title'] ?? null,
            'url' => $record['url'] ?? null,
            'video_url' => $record['video_url'] ?? null,
            'logo' => $record['logo'] ?? null,
            'product' => $record['product'] ?? null,
            'product_logo' => $record['product_logo'] ?? null,
            'product_link' => $record['product_link'] ?? $record['product_url'] ?? null,
            'platform' => $record['platform'] ?? null,
            'industry' => $record['industry'] ?? null,
            'interaction' => $this->normalizeArray($record['interaction'] ?? []),
            'description' => $record['description'] ?? null,
            'meta_description' => $record['meta_description'] ?? null,
            'keywords' => $this->normalizeArray($record['keywords'] ?? $record['focus_keyword'] ?? []),
            'seo_title' => $record['seo_title'] ?? null,
        ];
    }

    /**
     * Normalize array fields (handle both array and comma-separated strings)
     */
    private function normalizeArray($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            // Split by comma and trim whitespace
            return array_filter(array_map('trim', explode(',', $value)));
        }

        return [];
    }

    /**
     * Validate import record
     */
    private function validateRecord(array $record): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($record, [
            'id' => 'required|string',
            'title' => 'required|string|max:255',
            'video_url' => 'required|url',
            'published_date' => 'nullable|date_format:Y-m-d',
            'url' => 'nullable|url',
            'logo' => 'nullable|string',
            'product' => 'nullable|string',
            'product_logo' => 'nullable|string',
            'product_url' => 'nullable|string',
            'platform' => 'nullable|string',
            'industry' => 'nullable|string',
            'interaction' => 'nullable|array',
            'interaction.*' => 'string',
            'meta_description' => 'nullable|string|max:500',
            'seo_title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string',
        ]);
    }

    /**
     * Generate sample CSV template
     */
    public static function generateCsvTemplate(): string
    {
        $headers = [
            'id',
            'published_date',
            'title',
            'url',
            'video_url',
            'product',
            'product_logo',
            'product_url',
            'platform',
            'industry',
            'interaction',
            'description',
            'meta_description',
            'seo_title',
            'keywords',
            'logo'
        ];

        $sampleData = [
            '10645',
            '2025-10-13',
            'Sample Animation Title',
            'https://example.com/sample',
            'https://example.com/video.mp4',
            'Product Name',
            'https://example.com/logo.jpg',
            'https://example.com/product_url',
            'Website',
            'Technology',
            'Carousel, Drag, Loop',
            'Sample description',
            'Meta description',
            'SEO Title',
            'keyword1, keyword2',
            'https://example.com/logo.svg'
        ];

        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, $headers);
        fputcsv($csv, $sampleData);
        rewind($csv);
        $template = stream_get_contents($csv);
        fclose($csv);

        return $template;
    }

    /**
     * Generate sample JSON template
     */
    public static function generateJsonTemplate(): string
    {
        $template = [
            'animations' => [
                [
                    'id' => '10645',
                    'published_date' => '2025-10-13',
                    'title' => 'Sample Animation Title',
                    'url' => 'https://example.com/sample',
                    'video_url' => 'https://example.com/video.mp4',
                    'product' => 'Product Name',
                    'product_logo' => 'https://example.com/logo.jpg',
                    'product_link' => 'https://example.com/product_url',
                    'platform' => 'Website',
                    'industry' => 'Technology',
                    'interaction' => ['Carousel', 'Drag', 'Loop'],
                    'description' => 'Sample description',
                    'meta_description' => 'Meta description',
                    'seo_title' => 'SEO Title',
                    'keywords' => ['keyword1', 'keyword2'],
                    'logo' => 'https://example.com/logo.svg'
                ]
            ]
        ];

        return json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}
