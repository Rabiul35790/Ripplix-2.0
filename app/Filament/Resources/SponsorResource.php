<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SponsorResource\Pages;
use App\Models\Sponsor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Forms\Components\Grid;
use Filament\Tables\Actions\BulkAction;
use Illuminate\Database\Eloquent\Collection;

class SponsorResource extends Resource
{
    protected static ?string $model = Sponsor::class;

    protected static ?string $navigationIcon = 'heroicon-o-heart';

    protected static ?string $navigationLabel = 'Sponsorship Requests';

    protected static ?string $modelLabel = 'Sponsorship Request';

    protected static ?string $pluralModelLabel = 'Sponsorship Requests';

    protected static ?int $navigationSort = 11;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(2)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpan(1)
                            ->disabled(),

                        TextInput::make('company_name')
                            ->label('Company/Brand Name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpan(1)
                            ->disabled(),

                        TextInput::make('email')
                            ->required()
                            ->email()
                            ->maxLength(255)
                            ->columnSpan(1)
                            ->disabled(),

                        TextInput::make('phone')
                            ->label('Contact Number')
                            ->required()
                            ->maxLength(20)
                            ->columnSpan(1)
                            ->disabled(),

                        Textarea::make('address')
                            ->required()
                            ->rows(3)
                            ->columnSpan(2)
                            ->disabled(),

                        TextInput::make('budget_range_min')
                            ->label('Budget Range (Min)')
                            ->numeric()
                            ->prefix('$')
                            ->columnSpan(1)
                            ->disabled(),

                        TextInput::make('budget_range_max')
                            ->label('Budget Range (Max)')
                            ->numeric()
                            ->prefix('$')
                            ->columnSpan(1)
                            ->disabled(),

                        Textarea::make('sponsorship_goals')
                            ->label('Sponsorship Goals')
                            ->rows(4)
                            ->columnSpan(2)
                            ->disabled(),

                        Textarea::make('message')
                            ->required()
                            ->rows(6)
                            ->columnSpan(2)
                            ->disabled(),

                        Toggle::make('is_read')
                            ->label('Mark as Read')
                            ->columnSpan(1),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('is_read')
                    ->label('Status')
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Read' : 'Unread')
                    ->color(fn (bool $state): string => $state ? 'success' : 'warning')
                    ->sortable(),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('company_name')
                    ->label('Company/Brand')
                    ->searchable()
                    ->sortable()
                    ->limit(30),

                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('phone')
                    ->label('Contact')
                    ->searchable(),

                TextColumn::make('budget_range')
                    ->label('Budget Range')
                    ->getStateUsing(function ($record) {
                        return $record->budget_range;
                    }),

                TextColumn::make('message')
                    ->searchable()
                    ->limit(80)
                    ->wrap(),

                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('is_read')
                    ->label('Read Status')
                    ->options([
                        1 => 'Read',
                        0 => 'Unread',
                    ])
                    ->placeholder('All Requests'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->label('Mark as Read/Unread'),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    BulkAction::make('markAsRead')
                        ->label('Mark as Read')
                        ->icon('heroicon-o-envelope-open')
                        ->color('success')
                        ->action(function (Collection $records) {
                            $records->each(function ($record) {
                                $record->update(['is_read' => true]);
                            });
                        }),

                    BulkAction::make('markAsUnread')
                        ->label('Mark as Unread')
                        ->icon('heroicon-o-envelope')
                        ->color('warning')
                        ->action(function (Collection $records) {
                            $records->each(function ($record) {
                                $record->update(['is_read' => false]);
                            });
                        }),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSponsors::route('/'),
            'view' => Pages\ViewSponsor::route('/{record}'),
            'edit' => Pages\EditSponsor::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->can('view_sponsors');
    }

    public static function canCreate(): bool
    {
        return false; // Sponsors are created from frontend only
    }

    public static function canEdit($record): bool
    {
        return auth()->check() && auth()->user()->can('edit_sponsors');
    }

    public static function canDelete($record): bool
    {
        return auth()->check() && auth()->user()->can('delete_sponsors');
    }

    public static function canView($record): bool
    {
        return auth()->check() && auth()->user()->can('view_sponsors');
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            return static::getModel()::where('is_read', false)->count() ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
