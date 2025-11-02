@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {{-- Breadcrumbs --}}
    @if($library->breadcrumbs)
    <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm">
            @foreach($library->breadcrumbs as $breadcrumb)
                <li>
                    @if($loop->last)
                        <span class="text-gray-500">{{ $breadcrumb['name'] }}</span>
                    @else
                        <a href="{{ $breadcrumb['url'] }}" class="text-blue-600 hover:text-blue-800">
                            {{ $breadcrumb['name'] }}
                        </a>
                        <span class="mx-2 text-gray-400">/</span>
                    @endif
                </li>
            @endforeach
        </ol>
    </nav>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {{-- Main Content --}}
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow overflow-hidden">
                {{-- Header --}}
                <div class="p-6 border-b">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $library->title }}</h1>

                    {{-- Meta Info --}}
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{{ $library->created_at->format('M d, Y') }}</span>
                        @if($library->seo_score > 0)
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                @if($library->seo_score >= 80) bg-green-100 text-green-800
                                @elseif($library->seo_score >= 60) bg-yellow-100 text-yellow-800
                                @else bg-red-100 text-red-800
                                @endif">
                                SEO Score: {{ $library->seo_score }}/100
                            </span>
                        @endif
                    </div>
                </div>

                {{-- Video Player --}}
                @if($library->video_url)
                <div class="aspect-w-16 aspect-h-9">
                    <iframe
                        src="{{ $library->video_url }}"
                        title="{{ $library->title }}"
                        class="w-full h-96"
                        allowfullscreen>
                    </iframe>
                </div>
                @endif

                {{-- Description --}}
                @if($library->description)
                <div class="p-6">
                    <div class="prose max-w-none">
                        {!! nl2br(e($library->description)) !!}
                    </div>
                </div>
                @endif

                {{-- Keywords --}}
                @if($library->keywords)
                <div class="px-6 pb-6">
                    <div class="flex flex-wrap gap-2">
                        @foreach($library->keywords as $keyword)
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {{ $keyword }}
                            </span>
                        @endforeach
                    </div>
                </div>
                @endif
            </div>
        </div>

        {{-- Sidebar --}}
        <div class="space-y-6">
            {{-- Categories --}}
            @if($library->categories->isNotEmpty())
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div class="space-y-2">
                    @foreach($library->categories as $category)
                        <a href="{{ route('libraries.category', $category->slug) }}"
                           class="block text-blue-600 hover:text-blue-800">
                            {{ $category->name }}
                        </a>
                    @endforeach
                </div>
            </div>
            @endif

            {{-- Platforms --}}
            @if($library->platforms->isNotEmpty())
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Platforms</h3>
                <div class="space-y-2">
                    @foreach($library->platforms as $platform)
                        <a href="{{ route('libraries.platform', $platform->slug) }}"
                           class="block text-blue-600 hover:text-blue-800">
                            {{ $platform->name }}
                        </a>
                    @endforeach
                </div>
            </div>
            @endif

            {{-- Industries --}}
            @if($library->industries->isNotEmpty())
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Industries</h3>
                <div class="space-y-2">
                    @foreach($library->industries as $industry)
                        <a href="{{ route('libraries.industry', $industry->slug) }}"
                           class="block text-blue-600 hover:text-blue-800">
                            {{ $industry->name }}
                        </a>
                    @endforeach
                </div>
            </div>
            @endif

            {{-- SEO Info (for authenticated users) --}}
            @auth
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-medium">Focus Keyword:</span>
                        {{ $library->focus_keyword ?? 'Not set' }}
                    </div>
                    <div>
                        <span class="font-medium">Content Length:</span>
                        {{ $library->content_length ?? 0 }} characters
                    </div>
                    <div>
                        <span class="font-medium">Readability Score:</span>
                        {{ $library->readability_score ?? 0 }}/100
                    </div>
                    @if($library->last_seo_check)
                    <div>
                        <span class="font-medium">Last SEO Check:</span>
                        {{ $library->last_seo_check->diffForHumans() }}
                    </div>
                    @endif
                </div>
            </div>
            @endauth
        </div>
    </div>
</div>
@endsection
