<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Filament\Resources\PaymentResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\Grid;

class ViewPayment extends ViewRecord
{
    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make()
                ->visible(fn () => auth()->user()->can('edit_payments')),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Payment Details')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('transaction_id')
                                    ->label('Transaction ID')
                                    ->copyable(),

                                TextEntry::make('status')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'pending' => 'warning',
                                        'completed' => 'success',
                                        'failed' => 'danger',
                                        'cancelled' => 'gray',
                                        'refunded' => 'info',
                                        default => 'gray',
                                    }),

                                TextEntry::make('amount')
                                    ->money('USD'),

                                TextEntry::make('currency')
                                    ->default('USD'),

                                TextEntry::make('created_at')
                                    ->label('Payment Date')
                                    ->dateTime(),

                                TextEntry::make('updated_at')
                                    ->label('Last Updated')
                                    ->dateTime(),
                            ]),
                    ]),

                Section::make('Customer Information')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('user.name')
                                    ->label('Customer Name'),

                                TextEntry::make('user.email')
                                    ->label('Customer Email')
                                    ->copyable(),
                            ]),
                    ]),

                Section::make('Plan & Gateway')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('pricingPlan.name')
                                    ->label('Pricing Plan'),

                                TextEntry::make('paymentGateway.name')
                                    ->label('Payment Gateway'),

                                TextEntry::make('pricingPlan.price')
                                    ->label('Plan Price')
                                    ->money('USD'),

                                TextEntry::make('paymentGateway.type')
                                    ->label('Gateway Type'),
                            ]),
                    ]),

                Section::make('Additional Information')
                    ->schema([
                        TextEntry::make('notes')
                            ->columnSpanFull()
                            ->placeholder('No additional notes'),

                        TextEntry::make('gateway_transaction_id')
                            ->label('Gateway Transaction ID')
                            ->copyable()
                            ->placeholder('Not available'),

                        TextEntry::make('failure_reason')
                            ->label('Failure Reason')
                            ->visible(fn ($record) => $record->status === 'failed')
                            ->placeholder('No failure reason recorded'),
                    ])
                    ->collapsible(),
            ]);
    }
}
