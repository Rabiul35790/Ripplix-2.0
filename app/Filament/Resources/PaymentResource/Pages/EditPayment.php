<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Filament\Resources\PaymentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Notifications\Notification;

class EditPayment extends EditRecord
{
    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->requiresConfirmation()
                ->modalHeading('Delete Payment')
                ->modalDescription('Are you sure you want to delete this payment record? This action cannot be undone.')
                ->modalSubmitActionLabel('Delete')
                ->visible(fn () => auth()->user()->can('delete_payments')),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }

    protected function getSavedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Payment Updated')
            ->body('The payment status has been updated successfully.');
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Log status changes for audit trail
        if (isset($data['status']) && $data['status'] !== $this->getRecord()->status) {
            $data['status_changed_at'] = now();
            $data['status_changed_by'] = auth()->id();
        }

        return $data;
    }

    protected function afterSave(): void
    {
        // You can add additional logic here after saving
        // For example, sending notifications, updating related records, etc.

        $record = $this->getRecord();

        // Example: Send notification to user if payment status changed to completed
        if ($record->status === 'completed' && $record->wasChanged('status')) {
            // Send completion notification logic here
        }
    }
}
