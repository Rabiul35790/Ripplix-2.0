<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InteractionVariantResource\Pages;
use App\Models\InteractionVariant;
use App\Models\Interaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class InteractionVariantResource extends Resource
{
    protected static ?string $model = InteractionVariant::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-plus';
    protected static ?string $navigationGroup = 'Library Management';
    protected static ?int $navigationSort = 6;
    protected static ?string $navigationLabel = 'Interaction Variants';

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

            Forms\Components\Section::make('Interactions')
                ->schema([
                    Forms\Components\CheckboxList::make('interactions')
                        ->relationship('interactions', 'name')
                        ->searchable()
                        ->bulkToggleable()
                        ->columns(3)
                        ->gridDirection('row')
                        ->label('Select Interactions')
                        ->helperText('Choose which interactions belong to this variant'),
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

                Tables\Columns\TextColumn::make('interactions_count')
                    ->counts('interactions')
                    ->label('Interactions'),

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
            'index' => Pages\ListInteractionVariants::route('/'),
            'create' => Pages\CreateInteractionVariant::route('/create'),
            'edit' => Pages\EditInteractionVariant::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_interaction_variants');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_interaction_variants');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_interaction_variants');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_interaction_variants');
    }
}
