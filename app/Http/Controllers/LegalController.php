<?php

namespace App\Http\Controllers;

use App\Models\Legal;
use App\Models\Platform;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LegalController extends Controller
{
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(['id', 'name', 'slug']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'image']),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }

    private function getUserPlanLimits($user)
    {
        if (!$user) {
            return null;
        }
        return $user->getPlanLimits();
    }

    private function getCurrentPlan($user)
    {
        if (!$user) {
            return null;
        }

        try {
            return Cache::remember("user_current_plan_{$user->id}", 300, function() use ($user) {
                return $user->getCurrentPlan();
            });
        } catch (\Exception $e) {
            // Fallback without cache if error
            return $user->getCurrentPlan();
        }
    }

    public function privacy(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the active privacy policy
        $legal = Legal::where('type', 'privacy_policy')
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('LegalShow', [
            'legal' => $legal,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }

    public function terms(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the active terms and conditions
        $legal = Legal::where('type', 'terms_conditions')
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('LegalShow', [
            'legal' => $legal,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }
    public function cookie(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the active terms and conditions
        $legal = Legal::where('type', 'cookie_policy')
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('LegalShow', [
            'legal' => $legal,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }


    public function disclaimer(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the active terms and conditions
        $legal = Legal::where('type', 'disclaimer')
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('LegalShow', [
            'legal' => $legal,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }

    public function reportcontentpolicy(Request $request)
    {
        $user = auth()->user();
        $settings = Setting::getInstance();

        // Get the active terms and conditions
        $legal = Legal::where('type', 'report_content_policy')
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('LegalShow', [
            'legal' => $legal,
            'userPlanLimits' => $this->getUserPlanLimits($user),
            'currentPlan' => $this->getCurrentPlan($user),
            'settings' => [
                'logo' => $settings->logo_url,
                'copyright_text' => $settings->copyright_text,
                'site_name' => $settings->site_name,
            ],
            'filters' => $this->getFilters(),
        ]);
    }
}
