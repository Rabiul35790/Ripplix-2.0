<?php

namespace App\Filament\Widgets;

use App\Models\Library;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class MostViewedLibrariesWidget extends BaseWidget
{
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Library::query()
                    ->withCount('views')
                    ->orderBy('views_count', 'desc')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('rank')
                    ->label('#')
                    ->state(function ($rowLoop) {
                        return $rowLoop->iteration;
                    })
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state === 1 => 'success',
                        $state === 2 => 'info',
                        $state === 3 => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\ImageColumn::make('logo')
                    ->circular()
                    ->size(40)
                    ->defaultImageUrl(url('/images/placeholder.png')),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(50)
                    ->weight('medium')
                    ->url(fn (Library $record): string => $record->video_url, shouldOpenInNewTab: true),

                Tables\Columns\TextColumn::make('categories.name')
                    ->badge()
                    ->separator(',')
                    ->limit(2),

                Tables\Columns\TextColumn::make('views_count')
                    ->label('Total Views')
                    ->badge()
                    ->color('success')
                    ->icon('heroicon-o-eye')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => number_format($state)),

                Tables\Columns\TextColumn::make('published_date')
                    ->date('M d, Y')
                    ->sortable(),
            ])
            ->heading('Top 10 Most Viewed Libraries')
            ->description('Libraries with the highest number of views')
            ->defaultSort('views_count', 'desc')
            ->paginated(false);
    }
}
