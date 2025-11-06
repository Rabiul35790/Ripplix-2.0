<x-filament-widgets::widget>
    <x-filament::section>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <!-- Total Views -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-eye"
                        class="h-5 w-5 text-primary-500"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Total Views
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($totalViews) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
            </div>

            <!-- Total Libraries -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-rectangle-stack"
                        class="h-5 w-5 text-success-500"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Total Libraries
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($totalLibraries) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">In database</p>
            </div>

            <!-- Active Libraries -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-check-circle"
                        class="h-5 w-5 text-success-600"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Active
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($activeLibraries) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Published</p>
            </div>

            <!-- Views Today -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-clock"
                        class="h-5 w-5 text-warning-500"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Today
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($viewsToday) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</p>
            </div>

            <!-- Views This Week -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-calendar"
                        class="h-5 w-5 text-info-500"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        This Week
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($viewsThisWeek) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</p>
            </div>

            <!-- Views This Month -->
            <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                    <x-filament::icon
                        icon="heroicon-o-chart-bar"
                        class="h-5 w-5 text-danger-500"
                    />
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        This Month
                    </h4>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($viewsThisMonth) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</p>
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
