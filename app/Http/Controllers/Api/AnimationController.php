<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Services\ApiImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnimationController extends Controller
{
    public function __construct(private ApiImportService $importService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $libraries = Library::with([
                'categories',
                'platforms',
                'industries',
                'interactions'
            ])
            ->where('is_active', true)
            ->get();

            $animations = $libraries->map(function ($library) {
                return [
                    'id' => $library->external_id,
                    'published_date' => $library->published_date?->format('Y-m-d'),
                    'title' => $library->title,
                    'url' => $library->url,
                    'video_url' => $library->video_url,
                    'product' => $this->getFirstRelationshipName($library->categories),
                    'product_logo' => $this->getFirstRelationshipImage($library->categories),
                    'platform' => $this->getFirstRelationshipName($library->platforms),
                    'industry' => $this->getFirstRelationshipName($library->industries),
                    'interaction' => $library->interactions->pluck('name')->toArray(),
                    'description' => $library->description,
                    'keywords' => $library->keywords,
                    'logo' => $library->logo
                ];
            });

            return response()->json([
                'animations' => $animations
            ], 200, [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch animations',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkStore(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'animations' => 'required|array|min:1',
                'animations.*.id' => 'required|string',
                'animations.*.title' => 'required|string|max:255',
                'animations.*.video_url' => 'required|url',
                'animations.*.published_date' => 'nullable|date_format:Y-m-d',
                'animations.*.url' => 'nullable|url',
                'animations.*.logo' => 'nullable|string',
                'animations.*.product' => 'nullable|string',
                'animations.*.product_logo' => 'nullable|string',
                'animations.*.platform' => 'nullable|string',
                'animations.*.industry' => 'nullable|string',
                'animations.*.interaction' => 'nullable|array',
                'animations.*.interaction.*' => 'string',
                'animations.*.meta_description' => 'nullable|string|max:500',
                'animations.*.seo_title' => 'nullable|string|max:255',
                'animations.*.description' => 'nullable|string',
                'animations.*.keywords' => 'nullable|array',
                'animations.*.keywords.*' => 'string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $animations = $request->input('animations');

            $importStats = [
                'total' => count($animations),
                'imported' => 0,
                'updated' => 0,
                'errors' => []
            ];

            foreach ($animations as $item) {
                try {
                    $result = $this->importService->processSingleLibraryItem($item);
                    if ($result['action'] === 'created') {
                        $importStats['imported']++;
                    } elseif ($result['action'] === 'updated') {
                        $importStats['updated']++;
                    }
                } catch (\Exception $e) {
                    $importStats['errors'][] = [
                        'id' => $item['id'] ?? 'unknown',
                        'title' => $item['title'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bulk import completed',
                'stats' => $importStats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getFirstRelationshipName($collection): string
    {
        return $collection->first()?->name ?? '';
    }

    private function getFirstRelationshipImage($collection): string
    {
        return $collection->first()?->image ?? '';
    }
}
