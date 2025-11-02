<?php

// app/Filament/Resources/SupportTicketResource/Pages/ViewSupportTicket.php
namespace App\Filament\Resources\SupportTicketResource\Pages;

use App\Filament\Resources\SupportTicketResource;
use App\Models\SupportReply;
use Filament\Resources\Pages\ViewRecord;
use Filament\Actions;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Filament\Notifications\Notification;

class ViewSupportTicket extends ViewRecord
{
    protected static string $resource = SupportTicketResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);

        // Mark ticket as read by admin when viewing
        $this->record->update(['is_read_by_admin' => true]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('reply')
                ->label('Reply to Ticket')
                ->icon('heroicon-o-chat-bubble-left')
                ->form([
                    Textarea::make('message')
                        ->label('Reply Message')
                        ->required()
                        ->rows(4),
                ])
                ->action(function (array $data): void {
                    // Create the reply
                    SupportReply::create([
                        'support_ticket_id' => $this->record->id,
                        'user_id' => auth()->id(),
                        'message' => $data['message'],
                        'sender_type' => 'admin',
                        'is_read' => false,
                    ]);

                    // Update ticket status and read flags
                    $this->record->update([
                        'last_reply_at' => now(),
                        'is_read_by_user' => false,
                        'is_read_by_admin' => true, // Admin has read it since they're replying
                    ]);

                    Notification::make()
                        ->title('Reply sent successfully')
                        ->success()
                        ->send();

                    // Refresh the record data to show the new reply
                    $this->record = $this->record->fresh(['replies.user']);
                }),
            Actions\EditAction::make(),
        ];
    }
}
