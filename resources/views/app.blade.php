<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="dns-prefetch" href="//{{ request()->getHost() }}">
        <link rel="preconnect" href="{{ url('/') }}" crossorigin>
        <link rel="preload" href="/images/Gif/amoweb.webm" as="video" type="video/webm">

        <title inertia>{{ config('app.name', 'Ripplix') }}</title>

        @if(env('VITE_CLARITY_PROJECT_ID'))
        <script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "{{ env('VITE_CLARITY_PROJECT_ID') }}");
        </script>
        @endif

        <!-- Favicon -->
        @if(\App\Helpers\SettingsHelper::favicon())
            <link rel="icon" type="image/png" href="{{ \App\Helpers\SettingsHelper::favicon() }}">
        @endif

        @if(isset($settings->hero_image))
            <link rel="preload" href="{{ $settings->hero_image }}" as="image">
        @endif
        <link rel="preload" href="/images/hero/tes1.jpg" as="image">
        <link rel="preload" href="/images/hero/tes2.jpg" as="image">
        <link rel="preload" href="/images/hero/tes3.jpg" as="image">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-[#F8F8F9]">
        @inertia
    </body>
</html>
