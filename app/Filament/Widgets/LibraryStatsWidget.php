<?php

namespace App\Filament\Widgets;

use App\Models\Library;
use App\Models\LibraryView;
use Filament\Widgets\Widget;

class LibraryStatsWidget extends Widget
{
    protected static ?int $sort = 1;
    protected int | string | array $columnSpan = 'full';

    protected static string $view = 'filament.widgets.library-stats';

    protected function getViewData(): array
    {
        return [
            'totalViews' => LibraryView::count(),
            'totalLibraries' => Library::count(),
            'activeLibraries' => Library::where('is_active', true)->count(),
            'viewsToday' => LibraryView::whereDate('created_at', today())->count(),
            'viewsThisWeek' => LibraryView::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'viewsThisMonth' => LibraryView::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];
    }
}
