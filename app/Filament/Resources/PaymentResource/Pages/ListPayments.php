<?php

// App/Filament/Resources/PaymentResource/Pages/ListPayments.php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Filament\Resources\PaymentResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;

class ListPayments extends ListRecords
{
    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No create action since payments are created programmatically
        ];
    }

    protected function getTableBulkActions(): array
    {
        return [
            BulkActionGroup::make([
                DeleteBulkAction::make()
                    ->requiresConfirmation()
                    ->modalHeading('Delete Payments')
                    ->modalDescription('Are you sure you want to delete these payments? This action cannot be undone.')
                    ->modalSubmitActionLabel('Delete')
                    ->visible(fn () => auth()->user()->can('delete_payments')),
            ]),
        ];
    }
}
