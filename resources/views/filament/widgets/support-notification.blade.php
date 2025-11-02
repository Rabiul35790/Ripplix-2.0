{{-- resources/views/filament/widgets/support-notification.blade.php --}}
<x-filament-widgets::widget>
    <div>
        <h1 class="text-md font-bold mb-4">Support Statistics</h1>
    </div>
    <x-filament::section>

        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <x-heroicon-o-bell class="w-5 h-5 text-warning-500" />
                <h3 class="text-base font-medium">Support Notifications</h3>
            </div>
            @if($this->getUnreadTicketsCount() > 0)
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {{ $this->getUnreadTicketsCount() }} unread
                </span>
            @endif
        </div>

        @if($this->getUnreadTicketsCount() > 0)
            <div class="mt-6 space-y-4">
                @foreach($this->getRecentTickets() as $ticket)
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {{ $ticket->subject }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                by {{ $ticket->user->name }} • {{ $ticket->created_at->diffForHumans() }}
                            </p>
                        </div>
                        <a href="{{ route('filament.admin.resources.support-tickets.view', $ticket) }}"
                           class="ml-2 text-primary-600 hover:text-primary-900 text-xs font-medium">
                            View
                        </a>
                    </div>
                @endforeach
            </div>
        @else
            <div class="mt-4 text-center py-4">
                <x-heroicon-o-check-circle class="mx-auto h-8 w-8 text-green-500" />
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">All caught up! No new support Request Message.</p>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
