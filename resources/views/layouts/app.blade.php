<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- SEO Meta Tags --}}
    <x-seo-head :library="$library ?? null" :title="$title ?? null" :description="$description ?? null" />

    {{-- Favicon --}}
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    {{-- Scripts --}}
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])

    @php
        $googleAdsEnabled = \App\Helpers\SettingsHelper::googleAdsEnabled();
        $googleAdsClient = \App\Helpers\SettingsHelper::googleAdsClient();
    @endphp
    @if($googleAdsEnabled && $googleAdsClient)
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ $googleAdsClient }}" crossorigin="anonymous"></script>
    @endif

    {{-- Additional head content --}}
    @stack('head')
</head>
<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-50">
        {{-- Navigation --}}
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="{{ route('home') }}" class="text-xl font-semibold text-gray-900">
                            {{ config('app.name') }}
                        </a>
                    </div>

                    <div class="flex items-center space-x-4">
                        <a href="{{ route('libraries.index') }}" class="text-gray-700 hover:text-gray-900">
                            Libraries
                        </a>
                        @auth
                            <a href="/admin" class="text-gray-700 hover:text-gray-900">
                                Admin
                            </a>
                        @endauth
                    </div>
                </div>
            </div>
        </nav>

        {{-- Main Content --}}
        <main>
            @yield('content')
        </main>

        {{-- Footer --}}
        <footer class="bg-white border-t">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div class="text-center text-gray-500">
                    <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>

    {{-- Scripts --}}
    @stack('scripts')
</body>
</html>
