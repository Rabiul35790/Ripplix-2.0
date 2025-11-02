<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Library;
use App\Models\Platform;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ErrorService;

class ErrorController extends Controller
{
    public function __construct(
        private ErrorService $errorService
    ) {}

    /**
     * Show custom error page
     */
    public function show(Request $request, int $status = 404)
    {
        if (!$this->errorService->shouldShowErrorPage($status)) {
            abort(404);
        }

        $errorPageData = $this->errorService->getErrorPageData($status);
        $suggestedActions = $this->errorService->getSuggestedActions($status);

        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);


        $filterType = null;
        $filterValue = null;
        $filterName = null;

        $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        return Inertia::render('Error', array_merge($errorPageData, [
            'suggestedActions' => $suggestedActions,
            'libraries' => $libraries,
            'filters' => $filters,
            'filterType' => $filterType,
            'filterValue' => $filterValue,
            'filterName' => $filterName,

        ]))->setStatusCode($status);
    }

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
