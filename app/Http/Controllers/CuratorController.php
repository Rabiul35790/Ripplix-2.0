<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Category;
use App\Models\Curator;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Library;
use App\Models\LibraryView;
use App\Models\Platform;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuratorController extends Controller
{
    /**
     * Display the curators page.
     */

    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }
    private function getUserPlanLimits(?User $user): ?array
    {
        if (!$user) {
            return null;
        }
        return $user->getPlanLimits();
    }

    public function index(Request $request )
    {
        $settings = Setting::getInstance();

        // Get libraries data similar to other pages
        // $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
        //     ->where('is_active', true);

        // $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        // Get all active curators ordered by sort_order
        $curators = Curator::active()
            ->ordered()
            ->get()
            ->map(function ($curator) {
                return [
                    'id' => $curator->id,
                    'title' => $curator->title,
                    'content' => $curator->content,
                    'image' => $curator->image ? asset('storage/' . $curator->image) : null,
                    'image_url' => $curator->image_url,
                    'image_name' => $curator->image_name,
                    'sort_order' => $curator->sort_order,
                    'created_at' => $curator->created_at,
                    'updated_at' => $curator->updated_at,
                ];
            });

        $isAuthenticated = auth()->check();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return Inertia::render('Curators', [
            'libraries' => [],
            'filters' => $filters,
            'filterType' => null,
            'filterValue' => null,
            'filterName' => null,
            'categoryData' => null,
            'curators' => $curators,
            'userPlanLimits' => $userPlanLimits,
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'settings' => [
                'emails' => $settings->emails ?? [],
                'phones' => $settings->phones ?? [],
                'addresses' => $settings->addresses ?? [],
                'copyright_text' => $settings->copyright_text,
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
            ]
        ]);
    }

    /**
     * Get filters data for the Layout component
     */
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(),
        ];
    }
}
