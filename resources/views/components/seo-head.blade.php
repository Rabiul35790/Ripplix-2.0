@props(['library' => null, 'title' => null, 'description' => null])

@php
    $seoTitle = $library?->seo_title ?? $title ?? config('app.name');
    $seoDescription = $library?->meta_description ?? $description ?? 'Discover amazing video content in our comprehensive library';
    $canonicalUrl = $library?->canonical_url ?? url()->current();
    $ogData = $library?->getOpenGraphData() ?? [];
    $robotsMeta = $library?->getMetaRobots() ?? 'index,follow';
    $keywords = $library?->keywords ?? [];
@endphp

{{-- Basic SEO Meta Tags --}}
<title>{{ $seoTitle }}</title>
<meta name="description" content="{{ $seoDescription }}">
<meta name="robots" content="{{ $robotsMeta }}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="canonical" href="{{ $canonicalUrl }}">

{{-- Keywords --}}
@if(!empty($keywords))
<meta name="keywords" content="{{ implode(', ', $keywords) }}">
@endif

{{-- Open Graph Meta Tags --}}
<meta property="og:title" content="{{ $ogData['title'] ?? $seoTitle }}">
<meta property="og:description" content="{{ $ogData['description'] ?? $seoDescription }}">
<meta property="og:type" content="{{ $ogData['type'] ?? 'website' }}">
<meta property="og:url" content="{{ $ogData['url'] ?? $canonicalUrl }}">
<meta property="og:site_name" content="{{ config('app.name') }}">
@if(!empty($ogData['image']))
<meta property="og:image" content="{{ $ogData['image'] }}">
<meta property="og:image:alt" content="{{ $seoTitle }}">
@endif

{{-- Additional Meta Tags --}}
<meta name="author" content="{{ config('app.name') }}">
<meta name="generator" content="Laravel {{ app()->version() }}">

{{-- Structured Data --}}
@if($library && $library->structured_data)
<script type="application/ld+json">
{!! $library->getStructuredDataJson() !!}
</script>
@endif

{{-- Breadcrumbs Schema --}}
@if($library)
@php
    $breadcrumbs = $library->generateBreadcrumbs();
@endphp
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        @foreach($breadcrumbs as $index => $breadcrumb)
        {
            "@type": "ListItem",
            "position": {{ $index + 1 }},
            "name": "{{ $breadcrumb['name'] }}",
            "item": "{{ $breadcrumb['url'] }}"
        }@if(!$loop->last),@endif
        @endforeach
    ]
}
</script>
@endif

{{-- Performance Hints --}}
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
