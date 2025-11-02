<?php

namespace App\Filament\Resources\PaymentGatewayResource\Pages;

use App\Filament\Resources\PaymentGatewayResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\KeyValueEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\Grid;
use Filament\Support\Colors\Color;

class ViewPaymentGateway extends ViewRecord
{
    protected static string $resource = PaymentGatewayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Gateway Overview')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('name')
                                    ->size('lg')
                                    ->weight('bold'),

                                TextEntry::make('provider')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'stripe' => 'purple',
                                        'paypal' => 'blue',
                                        'razorpay' => 'green',
                                        default => 'gray',
                                    }),

                                TextEntry::make('environment')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'production' => 'success',
                                        'sandbox' => 'warning',
                                        default => 'gray',
                                    }),
                            ]),

                        Grid::make(4)
                            ->schema([
                                IconEntry::make('is_active')
                                    ->label('Active')
                                    ->boolean(),

                                IconEntry::make('is_default')
                                    ->label('Default')
                                    ->boolean(),

                                TextEntry::make('priority')
                                    ->label('Priority'),

                                TextEntry::make('last_tested_at')
                                    ->label('Last Tested')
                                    ->dateTime()
                                    ->placeholder('Never'),
                            ]),

                        TextEntry::make('description')
                            ->columnSpanFull()
                            ->placeholder('No description provided'),
                    ]),

                Section::make('Fee Structure')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('transaction_fee_percentage')
                                    ->label('Percentage Fee')
                                    ->suffix('%'),

                                TextEntry::make('transaction_fee_fixed')
                                    ->label('Fixed Fee')
                                    ->money('USD'),

                                TextEntry::make('currency')
                                    ->label('Fee Currency'),
                            ]),
                    ]),

                Section::make('Supported Regions')
                    ->schema([
                        TextEntry::make('supported_currencies')
                            ->label('Currencies')
                            ->listWithLineBreaks()
                            ->placeholder('All currencies supported'),

                        TextEntry::make('supported_countries')
                            ->label('Countries')
                            ->listWithLineBreaks()
                            ->placeholder('All countries supported'),
                    ])
                    ->columns(2),

                Section::make('Configuration')
                    ->schema([
                        KeyValueEntry::make('configuration')
                            ->label('Gateway Settings'),
                    ])
                    ->collapsible(),

                Section::make('Webhook Configuration')
                    ->schema([
                        TextEntry::make('webhook_url')
                            ->label('Webhook URL')
                            ->copyable(),

                        TextEntry::make('webhook_secret')
                            ->label('Webhook Secret')
                            ->placeholder('Not configured')
                            ->copyable(),
                    ])
                    ->columns(2),

                Section::make('Additional Information')
                    ->schema([
                        KeyValueEntry::make('metadata')
                            ->label('Metadata'),

                        TextEntry::make('test_notes')
                            ->label('Test Notes')
                            ->placeholder('No test notes')
                            ->columnSpanFull(),

                        Grid::make(2)
                            ->schema([
                                TextEntry::make('created_at')
                                    ->label('Created')
                                    ->dateTime(),

                                TextEntry::make('updated_at')
                                    ->label('Updated')
                                    ->dateTime(),
                            ]),
                    ])
                    ->collapsible()
                    ->collapsed(),
            ]);
    }
}
