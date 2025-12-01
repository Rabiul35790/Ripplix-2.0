<?php

namespace App\Http\Controllers;

use App\Models\Library;
use App\Models\LibraryView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class LibraryViewController extends Controller
{
    /**
     * Track a library view - FIXED with better error handling
     */
    public function trackView(Request $request, $libraryId): JsonResponse
    {
        try {
            // Validate that library exists
            $library = Library::find($libraryId);

            if (!$library) {
                return response()->json([
                    'success' => false,
                    'message' => 'Library not found'
                ], 404);
            }

            $userId = auth()->id();
            $sessionId = $request->session()->getId();

            // Track view asynchronously to avoid blocking
            LibraryView::trackView($library->id, $userId, $sessionId);

            return response()->json([
                'success' => true,
                'message' => 'View tracked successfully'
            ]);

        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error('Error tracking library view', [
                'library_id' => $libraryId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to track view'
            ], 500);
        }
    }

    /**
     * Get all viewed library IDs for current user/session
     */
    public function getViewedLibraryIds(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            $sessionId = $request->session()->getId();

            $viewedLibraryIds = LibraryView::getViewedLibraryIds($userId, $sessionId);

            return response()->json([
                'viewed_library_ids' => $viewedLibraryIds
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching viewed library IDs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'viewed_library_ids' => []
            ]);
        }
    }
}
