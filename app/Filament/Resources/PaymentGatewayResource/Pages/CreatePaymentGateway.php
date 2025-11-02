<?php

namespace App\Filament\Resources\PaymentGatewayResource\Pages;

use App\Filament\Resources\PaymentGatewayResource;
use App\Models\PaymentGateway;
use Filament\Resources\Pages\CreateRecord;

class CreatePaymentGateway extends CreateRecord
{
    protected static string $resource = PaymentGatewayResource::class;

    protected function afterCreate(): void
    {
        // Ensure only one gateway is active at a time
        if ($this->record->is_active) {
            PaymentGateway::where('id', '!=', $this->record->id)
                ->update(['is_active' => false]);
        }
    }
}
