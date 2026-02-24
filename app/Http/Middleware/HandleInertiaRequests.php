<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy as ZiggyZiggy;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => function () use ($request) {
                return [
                    'user' => $request->user() ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'avatar' => $request->user()->avatar,
                    ] : null,
                ];
            },
            'ziggy' => function () use ($request) {
                return array_merge((new ZiggyZiggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            'flash' => function () use ($request) {
                return [
                    'message' => $request->session()->get('message'),
                    'error' => $request->session()->get('error'),
                    'success' => $request->session()->get('success'),
                ];
            },
            'seoSettings' => function () {
                $settings = Setting::first();

                return [
                    'site_name' => $settings?->site_name,
                    'seo_settings' => $settings?->seo_settings ?? [],
                ];
            },
            'adSettings' => function () use ($request) {
                $settings = Setting::first();
                $user = $request->user();

                $canShowAds = true;
                if ($user) {
                    $limits = $user->getPlanLimits();
                    $canShowAds = (bool) ($limits['isFree'] ?? false);
                }

                return [
                    'enabled' => (bool) ($settings?->google_ads_enabled ?? false),
                    'client' => $settings?->google_adsense_client,
                    'slots' => [
                        'sidebar' => $settings?->google_ads_slot_sidebar,
                        'home' => $settings?->google_ads_slot_home,
                        'modal' => $settings?->google_ads_slot_modal,
                        'in_feed' => $settings?->google_ads_slot_in_feed,
                    ],
                    'can_show_ads' => $canShowAds,
                ];
            },
        ]);
    }
}
