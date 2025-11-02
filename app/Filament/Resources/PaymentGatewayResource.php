<?php
// app/Filament/Resources/PaymentGatewayResource.php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentGatewayResource\Pages;
use App\Models\PaymentGateway;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentGatewayResource extends Resource
{
    protected static ?string $model = PaymentGateway::class;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?int $navigationSort = 2;
    protected static ?string $navigationGroup = 'Payment Management';

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_payment_gateways');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_payment_gateways');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_payment_gateways');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_payment_gateways');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('name')
                ->options([
                    'Stripe' => 'Stripe',
                    'SSLCommerz' => 'SSLCommerz',
                ])
                ->required()
                ->live()
                ->afterStateUpdated(fn ($state, callable $set) =>
                    $set('slug', strtolower($state))
                ),

            Forms\Components\TextInput::make('slug')
                ->required()
                ->unique(ignoreRecord: true)
                ->readOnly(),

            Forms\Components\TextInput::make('publishable_key')
                ->label('Publishable Key')
                ->required()
                ->visible(fn ($get) => in_array($get('name'), ['Stripe', 'SSLCommerz'])),

            Forms\Components\TextInput::make('secret_key')
                ->label('Secret Key')
                ->required()
                ->password()
                ->revealable(),

            Forms\Components\Select::make('mode')
                ->options([
                    'test' => 'Test',
                    'live' => 'Live',
                ])
                ->default('test')
                ->required(),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(false)
                ->helperText('Only one gateway can be active at a time'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('mode')
                    ->colors([
                        'warning' => 'test',
                        'success' => 'live',
                    ]),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('mode')
                    ->options([
                        'test' => 'Test',
                        'live' => 'Live',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPaymentGateways::route('/'),
            'create' => Pages\CreatePaymentGateway::route('/create'),
            'edit' => Pages\EditPaymentGateway::route('/{record}/edit'),
        ];
    }
}
