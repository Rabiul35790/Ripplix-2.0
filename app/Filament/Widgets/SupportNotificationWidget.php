<?php

// app/Filament/Widgets/SupportNotificationWidget.php
namespace App\Filament\Widgets;

use App\Models\SupportTicket;
use Filament\Widgets\Widget;

class SupportNotificationWidget extends Widget
{
    protected static string $view = 'filament.widgets.support-notification';

    protected static ?int $sort = 1;

    // protected static bool $isLazy = false;

    public function getUnreadTicketsCount(): int
    {
        return SupportTicket::where('is_read_by_admin', false)->count();
    }

    public function getRecentTickets()
    {
        return SupportTicket::with('user')
            ->where('is_read_by_admin', false)
            ->latest()
            ->limit(5)
            ->get();
    }

}
