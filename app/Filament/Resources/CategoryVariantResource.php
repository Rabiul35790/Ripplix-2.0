<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryVariantResource\Pages;
use App\Models\CategoryVariant;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class CategoryVariantResource extends Resource
{
    protected static ?string $model = CategoryVariant::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationGroup = 'Library Management';
    protected static ?int $navigationSort = 3;
    protected static ?string $navigationLabel = 'Category Variants';

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
                ->label('Variant Name'),

            Forms\Components\TextInput::make('order')
                ->numeric()
                ->default(0)
                ->label('Display Order')
                ->helperText('Lower numbers appear first'),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(true),

            Forms\Components\Section::make('Categories')
                ->schema([
                    Forms\Components\CheckboxList::make('categories')
                        ->relationship('categories', 'name')
                        ->searchable()
                        ->bulkToggleable()
                        ->columns(3)
                        ->gridDirection('row')
                        ->label('Select Categories')
                        ->helperText('Choose which categories belong to this variant'),
                ])
                ->collapsible(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Variant Name'),

                Tables\Columns\TextColumn::make('order')
                    ->sortable()
                    ->label('Order'),

                Tables\Columns\TextColumn::make('categories_count')
                    ->counts('categories')
                    ->label('Categories'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->trueLabel('Active')
                    ->falseLabel('Inactive')
                    ->placeholder('All'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('makeActive')
                        ->label('Mark as Active')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_active' => true]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Variants activated successfully'),

                    Tables\Actions\BulkAction::make('makeInactive')
                        ->label('Mark as Inactive')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $records->each->update(['is_active' => false]);
                        })
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Variants deactivated successfully'),
                ]),
            ])
            ->defaultSort('order', 'asc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategoryVariants::route('/'),
            'create' => Pages\CreateCategoryVariant::route('/create'),
            'edit' => Pages\EditCategoryVariant::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_category_variants');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_category_variants');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_category_variants');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_category_variants');
    }
}
