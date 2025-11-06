<?php

namespace App\Filament\Resources;

use App\Filament\Resources\IndustryResource\Pages;
use App\Models\Industry;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Collection;

class IndustryResource extends Resource
{
    protected static ?string $model = Industry::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office';
    protected static ?string $navigationGroup = 'Library Management';
    protected static ?int $navigationSort = 4;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(function (string $context, $state, Forms\Set $set) {
                    if ($context === 'create') {
                        $set('slug', Str::slug($state));
                    }
                }),

            Forms\Components\TextInput::make('slug')
                ->required()
                ->maxLength(255)
                ->unique(Industry::class, 'slug', ignoreRecord: true),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(true),

            Forms\Components\Toggle::make('is_top')
                ->label('Is Top')
                ->default(false)
                ->helperText('Mark this industry as a top industry.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('slug')->searchable(),
                Tables\Columns\TextColumn::make('libraries_count')
                    ->counts('libraries')
                    ->label('Total Libraries'),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
                Tables\Columns\IconColumn::make('is_top')->boolean()->label('Top'),
            ])
            ->filters([
                // ✅ Filter by Active/Inactive
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->trueLabel('Active')
                    ->falseLabel('Inactive')
                    ->placeholder('All'),

                // ✅ Filter by Top/Non-Top
                Tables\Filters\TernaryFilter::make('is_top')
                    ->label('Top Industry')
                    ->trueLabel('Top')
                    ->falseLabel('Non-Top')
                    ->placeholder('All'),

                // ✅ Filter by Library Count Range
                Tables\Filters\Filter::make('library_count')
                    ->label('Library Count')
                    ->form([
                        Forms\Components\TextInput::make('min')->numeric()->label('Min Count'),
                        Forms\Components\TextInput::make('max')->numeric()->label('Max Count'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['min'], fn($q, $min) => $q->has('libraries', '>=', $min))
                            ->when($data['max'], fn($q, $max) => $q->has('libraries', '<=', $max));
                    }),

                // ✅ Filter by name (custom text search)
                Tables\Filters\Filter::make('name_search')
                    ->label('Search by Name')
                    ->form([
                        Forms\Components\TextInput::make('name')->label('Name Contains'),
                    ])
                    ->query(fn($query, $data) =>
                        $query->when($data['name'], fn($q, $name) => $q->where('name', 'like', "%{$name}%"))
                    ),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    // Delete bulk action
                    Tables\Actions\DeleteBulkAction::make(),

                    // Make Active
                    Tables\Actions\BulkAction::make('makeActive')
                        ->label('Mark as Active')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_active' => true]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Industries activated successfully'),

                    // Make Inactive
                    Tables\Actions\BulkAction::make('makeInactive')
                        ->label('Mark as Inactive')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_active' => false]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Industries deactivated successfully'),

                    // Make Top Industry
                    Tables\Actions\BulkAction::make('makeTop')
                        ->label('Mark as Top')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_top' => true]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Industries marked as top successfully'),

                    // Remove Top Industry
                    Tables\Actions\BulkAction::make('removeTop')
                        ->label('Remove from Top')
                        ->icon('heroicon-o-minus-circle')
                        ->color('gray')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_top' => false]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Industries removed from top successfully'),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListIndustries::route('/'),
            'create' => Pages\CreateIndustry::route('/create'),
            'edit' => Pages\EditIndustry::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_industries');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_industries');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_industries');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_industries');
    }
}
