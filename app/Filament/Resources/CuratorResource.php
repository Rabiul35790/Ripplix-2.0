<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CuratorResource\Pages;
use App\Models\Curator;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\BulkAction;
use Illuminate\Database\Eloquent\Collection;
use Filament\Forms\Components\Hidden;

class CuratorResource extends Resource
{
    protected static ?string $model = Curator::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Curators';

    protected static ?string $modelLabel = 'Curator';

    protected static ?string $pluralModelLabel = 'Curators';

    protected static ?int $navigationSort = 15;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Curator Information')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('title')
                                    ->label('Title (Optional)')
                                    ->maxLength(255)
                                    ->columnSpan(1)
                                    ->placeholder('Enter curator title/name'),

                                TextInput::make('sort_order')
                                    ->label('Sort Order')
                                    ->numeric()
                                    ->default(0)
                                    ->columnSpan(1)
                                    ->helperText('Lower numbers appear first'),
                            ]),

                        RichEditor::make('content')
                            ->label('Content')
                            ->required()
                            ->columnSpanFull()
                            ->toolbarButtons([
                                'attachFiles',
                                'blockquote',
                                'bold',
                                'bulletList',
                                'codeBlock',
                                'h2',
                                'h3',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'underline',
                                'undo',
                            ])
                            ->placeholder('Enter curator information, bio, or description...'),

                        FileUpload::make('image')
                            ->label('Image')
                            ->image()
                            ->directory('curators')
                            ->visibility('public')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->maxSize(20480) // 5MB
                            ->helperText('Upload an image for this curator (max 5MB)')
                            ->columnSpanFull(),

                        TextInput::make('image_name')
                                    ->label('Image Name (Optional)')
                                    ->maxLength(255)
                                    ->columnSpan(1)
                                    ->placeholder('Enter Image Name'),

                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->helperText('Only active curators will be displayed on the website'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable()
                    ->width(80),

                ImageColumn::make('image')
                    ->label('Image')
                    ->circular()
                    ->size(60),

                TextColumn::make('title')
                    ->label('Title')
                    ->searchable()
                    ->sortable()
                    ->placeholder('No title'),

                TextColumn::make('content')
                    ->label('Content')
                    ->html()
                    ->limit(100)
                    ->wrap()
                    ->searchable(),

                TextColumn::make('image_name')
                    ->label('Image Name')
                    ->searchable()
                    ->sortable()
                    ->placeholder('No Name'),

                IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('is_active')
                    ->label('Status')
                    ->options([
                        1 => 'Active',
                        0 => 'Inactive',
                    ])
                    ->placeholder('All Curators'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    BulkAction::make('activate')
                        ->label('Activate')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(function (Collection $records) {
                            $records->each(function ($record) {
                                $record->update(['is_active' => true]);
                            });
                        }),

                    BulkAction::make('deactivate')
                        ->label('Deactivate')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(function (Collection $records) {
                            $records->each(function ($record) {
                                $record->update(['is_active' => false]);
                            });
                        }),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order', 'asc')
            ->reorderable('sort_order')
            ->paginationPageOptions([10, 25, 50]);
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
            'index' => Pages\ListCurators::route('/'),
            'create' => Pages\CreateCurator::route('/create'),
            'view' => Pages\ViewCurator::route('/{record}'),
            'edit' => Pages\EditCurator::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->can('view_curators');
    }

    public static function canCreate(): bool
    {
        return auth()->check() && auth()->user()->can('create_curators');
    }

    public static function canEdit($record): bool
    {
        return auth()->check() && auth()->user()->can('edit_curators');
    }

    public static function canDelete($record): bool
    {
        return auth()->check() && auth()->user()->can('delete_curators');
    }

    public static function canView($record): bool
    {
        return auth()->check() && auth()->user()->can('view_curators');
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            return static::getModel()::active()->count() ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
