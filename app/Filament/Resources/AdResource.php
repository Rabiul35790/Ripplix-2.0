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
use Filament\Forms\Components\Radio;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\ActionGroup;
use Filament\Forms\Components\Grid;
use Filament\Support\Enums\FontWeight;
use Filament\Forms\Get;

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

                        Radio::make('media_type')
                            ->label('Media Type')
                            ->required()
                            ->options([
                                'image' => 'Image',
                                'video' => 'Video',
                            ])
                            ->default('image')
                            ->inline()
                            ->columnSpan(2)
                            ->live()
                            ->afterStateUpdated(function ($state, callable $set) {
                                // Clear the opposite field when switching types
                                if ($state === 'image') {
                                    $set('video', null);
                                } else {
                                    $set('image', null);
                                }
                            }),

                        FileUpload::make('image')
                            ->label('Image')
                            ->image()
                            ->directory('ads/images')
                            ->visibility('public')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '1:1',
                                '16:9',
                                '4:3',
                            ])
                            ->columnSpan(2)
                            ->helperText('Upload an image for the advertisement')
                            ->hidden(fn (Get $get): bool => $get('media_type') === 'video')
                            ->required(fn (Get $get): bool => $get('media_type') === 'image'),

                        FileUpload::make('video')
                            ->label('Video')
                            ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/ogg'])
                            ->directory('ads/videos')
                            ->visibility('public')
                            ->maxSize(51200) // 50MB max
                            ->columnSpan(2)
                            ->helperText('Upload a video for the advertisement (MP4, WebM, or OGG format, max 50MB)')
                            ->hidden(fn (Get $get): bool => $get('media_type') === 'image')
                            ->required(fn (Get $get): bool => $get('media_type') === 'video'),

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
                                'in-feed' => 'In-Feed',
                            ])
                            ->default('sidebar')
                            ->columnSpan(1)
                            ->live()
                            ->helperText('Where the ad should appear on the website'),

                        TextInput::make('in_feed_name')
                            ->label('In-Feed Name')
                            ->maxLength(255)
                            ->columnSpan(1)
                            ->placeholder('e.g., Article Bottom, Post Middle')
                            ->helperText('Descriptive name for this in-feed ad placement')
                            ->hidden(fn (Get $get): bool => $get('position') !== 'in-feed')
                            ->required(fn (Get $get): bool => $get('position') === 'in-feed'),

                        TextInput::make('in_feed_link')
                            ->label('In-Feed Link Identifier')
                            ->maxLength(255)
                            ->columnSpan(1)
                            ->placeholder('e.g., article-bottom, post-middle')
                            ->helperText('Unique identifier for frontend integration (use lowercase with hyphens)')
                            ->hidden(fn (Get $get): bool => $get('position') !== 'in-feed')
                            ->required(fn (Get $get): bool => $get('position') === 'in-feed')
                            ->regex('/^[a-z0-9\-]+$/')
                            ->validationMessages([
                                'regex' => 'The link identifier must only contain lowercase letters, numbers, and hyphens.',
                            ]),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('Media')
                    ->circular()
                    ->size(50)
                    ->defaultImageUrl(url('/images/placeholder.png'))
                    ->extraAttributes(['class' => 'object-cover'])
                    ->getStateUsing(function (Ad $record) {
                        return $record->media_type === 'image' ? $record->image : null;
                    }),

                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Medium)
                    ->description(fn (Ad $record): string => \Str::limit($record->target_url, 40)),

                TextColumn::make('media_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'image' => 'info',
                        'video' => 'warning',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'image' => 'heroicon-m-photo',
                        'video' => 'heroicon-m-film',
                    })
                    ->formatStateUsing(fn (string $state): string => ucfirst($state)),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'danger',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'active' => 'heroicon-m-check-circle',
                        'inactive' => 'heroicon-m-x-circle',
                    }),

                TextColumn::make('position')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sidebar' => 'primary',
                        'modal' => 'warning',
                        'home' => 'success',
                        'in-feed' => 'info',
                        default => 'gray',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'sidebar' => 'heroicon-m-bars-3-center-left',
                        'modal' => 'heroicon-m-window',
                        'home' => 'heroicon-m-home',
                        'in-feed' => 'heroicon-m-queue-list',
                        default => 'heroicon-m-question-mark-circle',
                    })
                    ->description(fn (Ad $record): ?string =>
                        $record->position === 'in-feed' && $record->in_feed_name
                            ? $record->in_feed_name
                            : null
                    ),

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

                SelectFilter::make('media_type')
                    ->label('Media Type')
                    ->options([
                        'image' => 'Image',
                        'video' => 'Video',
                    ]),

                SelectFilter::make('position')
                    ->options([
                        'sidebar' => 'Sidebar',
                        'modal' => 'Modal',
                        'home' => 'Home',
                        'in-feed' => 'In-Feed',
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
