<?php

namespace App\Http\Controllers;

use App\Models\Library;
use App\Models\LibraryView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LibraryViewController extends Controller
{
    /**
     * Track a library view
     */
    public function trackView(Request $request, Library $library): JsonResponse
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();

        LibraryView::trackView($library->id, $userId, $sessionId);

        return response()->json([
            'success' => true,
            'message' => 'View tracked successfully'
        ]);
    }

    /**
     * Get all viewed library IDs for current user/session
     */
    public function getViewedLibraryIds(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();

        $viewedLibraryIds = LibraryView::getViewedLibraryIds($userId, $sessionId);

        return response()->json([
            'viewed_library_ids' => $viewedLibraryIds
        ]);
    }
}
