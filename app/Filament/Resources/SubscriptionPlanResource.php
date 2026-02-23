<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionPlanResource\Pages;
use App\Models\SubscriptionPlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionPlanResource extends Resource
{
    protected static ?string $model = SubscriptionPlan::class;
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';
    protected static ?string $navigationGroup = 'Subscription Management';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Plan Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->unique(SubscriptionPlan::class, 'slug', ignoreRecord: true)
                            ->maxLength(255)
                            ->helperText('URL-friendly identifier (e.g., pro-monthly)'),

                        Forms\Components\Textarea::make('description')
                            ->maxLength(500)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01)
                            ->helperText('Set to 0 for free plans'),

                        Forms\Components\Select::make('billing_period')
                            ->required()
                            ->options([
                                'free' => 'Free',
                                'monthly' => 'Monthly',
                                'yearly' => 'Yearly',
                                'lifetime' => 'Lifetime',
                            ])
                            ->default('monthly'),

                        Forms\Components\TextInput::make('stripe_price_id')
                            ->maxLength(255)
                            ->helperText('Stripe Price ID (e.g., price_xxxxx). Leave empty for free plans.')
                            ->placeholder('price_xxxxx'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Plan Limits & Features')
                    ->schema([
                        Forms\Components\TextInput::make('max_boards')
                            ->required()
                            ->numeric()
                            ->default(3)
                            ->minValue(0)
                            ->helperText('Set to ' . 2147483647 . ' for unlimited'),

                        Forms\Components\TextInput::make('max_libraries_per_board')
                            ->required()
                            ->numeric()
                            ->default(6)
                            ->minValue(0)
                            ->helperText('Set to ' . 2147483647 . ' for unlimited'),

                        Forms\Components\TextInput::make('daily_previews')
                            ->numeric()
                            ->minValue(0)
                            ->helperText('Leave empty for unlimited'),

                        Forms\Components\Toggle::make('can_share')
                            ->label('Can Share Boards')
                            ->default(false),

                        Forms\Components\KeyValue::make('features')
                            ->label('Feature List')
                            ->keyLabel('Feature')
                            ->valueLabel('Description')
                            ->addActionLabel('Add feature')
                            ->columnSpanFull()
                            ->helperText('Add features that will be displayed to users'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Settings')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->helperText('Inactive plans will not be shown to users'),

                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable()
                    ->badge()
                    ->color(fn ($state) => $state == 0 ? 'success' : 'primary'),

                Tables\Columns\TextColumn::make('billing_period')
                    ->badge()
                    ->colors([
                        'gray' => 'free',
                        'primary' => 'monthly',
                        'success' => 'yearly',
                        'warning' => 'lifetime',
                    ])
                    ->formatStateUsing(fn ($state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('users_count')
                    ->counts('users')
                    ->label('Active Users')
                    ->sortable(),

                Tables\Columns\TextColumn::make('max_boards')
                    ->label('Max Boards')
                    ->formatStateUsing(fn ($state) => $state == 2147483647 ? 'Unlimited' : $state)
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('can_share')
                    ->label('Can Share')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('billing_period')
                    ->options([
                        'free' => 'Free',
                        'monthly' => 'Monthly',
                        'yearly' => 'Yearly',
                        'lifetime' => 'Lifetime',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueLabel('Active Plans')
                    ->falseLabel('Inactive Plans')
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (SubscriptionPlan $record) {
                        // Prevent deletion of plans with active users
                        if ($record->users()->count() > 0) {
                            throw new \Exception('Cannot delete a plan with active users.');
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptionPlans::route('/'),
            'create' => Pages\CreateSubscriptionPlan::route('/create'),
            'view' => Pages\ViewSubscriptionPlan::route('/{record}'),
            'edit' => Pages\EditSubscriptionPlan::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_subscription_plans');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_subscription_plans');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_subscription_plans');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_subscription_plans');
    }
}
