<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Library;
use App\Models\Platform;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ApiImportService
{
    private string $apiUrl;

    public function __construct()
    {
        $this->apiUrl = 'https://www.ripplix.com/wp-json/ripplix/v1/animations/';
    }

    public function importFromApi(): array
    {
        try {
            $response = Http::timeout(60)->get($this->apiUrl);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch data from API: ' . $response->status());
            }

            $data = $response->json();

            if (empty($data)) {
                throw new \Exception('No data received from API');
            }

            $animations = $data['animations'] ?? [];

            if (empty($animations)) {
                throw new \Exception('No animations data found in API response');
            }

            $importStats = [
                'total' => count($animations),
                'imported' => 0,
                'updated' => 0,
                'errors' => []
            ];

            foreach ($animations as $item) {
                try {
                    $result = $this->processLibraryItem($item);
                    if ($result['action'] === 'created') {
                        $importStats['imported']++;
                    } elseif ($result['action'] === 'updated') {
                        $importStats['updated']++;
                    }
                } catch (\Exception $e) {
                    // Store detailed error information
                    $importStats['errors'][] = [
                        'id' => $item['id'] ?? 'N/A',
                        'title' => $item['title'] ?? 'N/A',
                        'error' => $e->getMessage()
                    ];

                    Log::error('Library import error', [
                        'item_id' => $item['id'] ?? 'N/A',
                        'title' => $item['title'] ?? 'N/A',
                        'error' => $e->getMessage(),
                        'item' => $item
                    ]);
                }
            }

            return $importStats;

        } catch (\Exception $e) {
            Log::error('API Import failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Process a single library item (exposed for bulk import)
     */
    public function processSingleLibraryItem(array $item): array
    {
        return $this->processLibraryItem($item);
    }

    private function processLibraryItem(array $item): array
    {
        // Validate required fields
        if (empty($item['id'])) {
            throw new \Exception('Missing required field: id');
        }
        if (empty($item['title'])) {
            throw new \Exception('Missing required field: title');
        }
        if (empty($item['video_url'])) {
            throw new \Exception('Missing required field: video_url');
        }

        $library = Library::where('external_id', $item['id'])->first();

        $slug = Str::slug($item['title']);

        // Check if slug already exists (for different external_id)
        $existingSlug = Library::where('slug', $slug)
            ->where('external_id', '!=', $item['id'])
            ->exists();

        if ($existingSlug) {
            // Make slug unique by appending external_id
            $slug = $slug . '-' . $item['id'];
        }

        $libraryData = [
            'external_id' => $item['id'],
            'published_date' => $item['published_date'] ?? null,
            'title' => $item['title'],
            'slug' => $slug,
            'url' => $item['url'] ?? null,
            'video_url' => $item['video_url'],
            'logo' => $item['logo'] ?? null,
            'description' => $item['description'] ?? null,
            'meta_description' => $item['meta_description'] ?? null,
            'keywords' => $item['keywords'] ?? null,
            'focus_keyword' => $item['focus_keyword'] ?? null,
            'seo_title' => $item['seo_title'] ?? null,
            'video_alt_text' => $item['video_alt_text'] ?? null,
            'og_title' => $item['og_title'] ?? null,
            'og_description' => $item['og_description'] ?? null,
            'og_image' => $item['og_image'] ?? null,
            'og_type' => $item['og_type'] ?? null,
            'structured_data' => $item['structured_data'] ?? null,
            'source' => 'api',
            'is_active' => true,
        ];

        if ($library) {
            $library->update($libraryData);
            $action = 'updated';
        } else {
            $library = Library::create($libraryData);
            $action = 'created';
        }

        $this->processRelationships($library, $item);
        $library->updateSeoScore();

        return ['library' => $library, 'action' => $action];
    }

    private function processRelationships(Library $library, array $item): void
    {
        if (!empty($item['product'])) {
            // UPDATED: Now passing product_link/product_url to category
            $category = $this->findOrCreateCategory(
                $item['product'],
                $item['product_logo'] ?? null,
                $item['product_link'] ?? $item['product_url'] ?? null  // NEW: Handle both attribute names
            );
            $library->categories()->syncWithoutDetaching([$category->id]);
        }

        if (!empty($item['platform'])) {
            $platform = $this->findOrCreatePlatform($item['platform']);
            $library->platforms()->syncWithoutDetaching([$platform->id]);
        }

        if (!empty($item['industry'])) {
            $industry = $this->findOrCreateIndustry($item['industry']);
            $library->industries()->syncWithoutDetaching([$industry->id]);
        }

        if (!empty($item['interaction']) && is_array($item['interaction'])) {
            $interactionIds = [];
            foreach ($item['interaction'] as $interactionName) {
                $interaction = $this->findOrCreateInteraction($interactionName);
                $interactionIds[] = $interaction->id;
            }
            $library->interactions()->syncWithoutDetaching($interactionIds);
        }
    }

    // UPDATED: Added $productUrl parameter
    private function findOrCreateCategory(string $name, ?string $image = null, ?string $productUrl = null): Category
    {
        $category = Category::where('slug', Str::slug($name))->first();

        if ($category) {
            // Update existing category if new data is provided
            $updateData = [];

            if ($image && !$category->image) {
                $updateData['image'] = $image;
            }

            if ($productUrl && !$category->product_url) {
                $updateData['product_url'] = $productUrl;
            }

            if (!empty($updateData)) {
                $category->update($updateData);
            }

            return $category;
        }

        // Create new category with all data
        return Category::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'image' => $image,
            'product_url' => $productUrl,  // NEW: Store product_url
            'is_active' => true,
        ]);
    }

    private function findOrCreatePlatform(string $name): Platform
    {
        return Platform::firstOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'is_active' => true,
            ]
        );
    }

    private function findOrCreateIndustry(string $name): Industry
    {
        return Industry::firstOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'is_active' => true,
            ]
        );
    }

    private function findOrCreateInteraction(string $name): Interaction
    {
        return Interaction::firstOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'is_active' => true,
            ]
        );
    }
}
