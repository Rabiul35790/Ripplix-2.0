<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AdResource\Pages;
use App\Filament\Resources\AdResource\RelationManagers;
use App\Models\Ad;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\ActionGroup;
use Filament\Forms\Components\Grid;
use Filament\Support\Enums\FontWeight;

class AdResource extends Resource
{
    protected static ?string $model = Ad::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationLabel = 'Advertisements';

    protected static ?string $modelLabel = 'Advertisement';

    protected static ?string $pluralModelLabel = 'Advertisements';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(2)
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->columnSpan(2)
                            ->placeholder('Internal title for the advertisement'),

                        FileUpload::make('image')
                            ->required()
                            ->image()
                            ->directory('ads')
                            ->visibility('public')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '1:1',
                                '16:9',
                                '4:3',
                            ])
                            ->columnSpan(2)
                            ->helperText('Upload an image for the advertisement'),

                        TextInput::make('target_url')
                            ->required()
                            ->url()
                            ->prefixIcon('heroicon-m-link')
                            ->columnSpan(2)
                            ->placeholder('https://example.com')
                            ->helperText('The URL where users will be redirected when they click the ad'),

                        DatePicker::make('start_date')
                            ->required()
                            ->default(now())
                            ->columnSpan(1)
                            ->helperText('When the ad should start showing'),

                        DatePicker::make('end_date')
                            ->required()
                            ->default(now()->addDays(30))
                            ->columnSpan(1)
                            ->after('start_date')
                            ->helperText('When the ad should stop showing'),

                        Select::make('status')
                            ->required()
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                            ])
                            ->default('active')
                            ->columnSpan(1)
                            ->helperText('Whether the ad is currently active'),

                        Select::make('position')
                            ->required()
                            ->options([
                                'sidebar' => 'Sidebar',
                                'modal' => 'Modal',
                                'home' => 'Home',
                            ])
                            ->default('sidebar')
                            ->columnSpan(1)
                            ->helperText('Where the ad should appear on the website'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->circular()
                    ->size(50)
                    ->defaultImageUrl(url('/images/placeholder.png'))
                    ->extraAttributes(['class' => 'object-cover']),

                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Medium)
                    ->description(fn (Ad $record): string => \Str::limit($record->target_url, 40)),

                BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'danger' => 'inactive',
                    ])
                    ->icons([
                        'heroicon-m-check-circle' => 'active',
                        'heroicon-m-x-circle' => 'inactive',
                    ]),

                BadgeColumn::make('position')
                    ->colors([
                        'primary' => 'sidebar',
                        'warning' => 'modal',
                        'success' => 'home',
                    ])
                    ->icons([
                        'heroicon-m-bars-3-center-left' => 'sidebar',
                        'heroicon-m-window' => 'modal',
                        'heroicon-m-home' => 'home',
                    ]),

                TextColumn::make('clicks')
                    ->sortable()
                    ->numeric()
                    ->icon('heroicon-m-cursor-arrow-rays')
                    ->color('success')
                    ->weight(FontWeight::Bold),

                TextColumn::make('start_date')
                    ->date()
                    ->sortable()
                    ->description(fn (Ad $record): string => 'Ends: ' . $record->end_date->format('M j, Y')),

                IconColumn::make('is_currently_active')
                    ->label('Active Now')
                    ->boolean()
                    ->state(fn (Ad $record): bool => $record->isCurrentlyActive())
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ]),

                SelectFilter::make('position')
                    ->options([
                        'sidebar' => 'Sidebar',
                        'modal' => 'Modal',
                        'home' => 'Home'
                    ]),

                Tables\Filters\Filter::make('currently_active')
                    ->label('Currently Active')
                    ->query(fn (Builder $query): Builder => $query->active()),
            ])
            ->actions([
                ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ])
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateIcon('heroicon-o-megaphone')
            ->emptyStateHeading('No advertisements yet')
            ->emptyStateDescription('Once you add advertisements, they will appear here.');
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
            'index' => Pages\ListAds::route('/'),
            'create' => Pages\CreateAd::route('/create'),
            'view' => Pages\ViewAd::route('/{record}'),
            'edit' => Pages\EditAd::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_ads');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_ads');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_ads');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_ads');
    }
}
