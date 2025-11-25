<?php

namespace App\Http\Controllers;

use App\Http\Requests\SponsorRequest;
use App\Models\Board;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\LibraryView;
use App\Models\Setting;
use App\Mail\SponsorFormMail;
use App\Models\Platform;
use App\Models\Sponsor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SponsorController extends Controller
{
    /**
     * Show the sponsor form - OPTIMIZED for instant loading.
     */
    private function getViewedLibraryIds(Request $request): array
    {
        $userId = auth()->id();
        $sessionId = $request->session()->getId();
        return LibraryView::getViewedLibraryIds($userId, $sessionId);
    }

    private function getUserPlanLimits(?User $user): ?array
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

        // Get current plan details
        if ($user->pricingPlan) {
            return [
                'id' => $user->pricingPlan->id,
                'name' => $user->pricingPlan->name,
                'slug' => $user->pricingPlan->slug ?? null,
                'price' => $user->pricingPlan->price ?? 0,
                'billing_period' => $user->pricingPlan->billing_period ?? 'monthly',
                'expires_at' => $user->subscription_ends_at ?? null,
                'days_until_expiry' => $user->daysUntilExpiry(),
            ];
        }

        return null;
    }

    public function index(Request $request)
    {
        $settings = Setting::getInstance();
        $isAuthenticated = auth()->check();
        $user = auth()->user();

        // Get lightweight filters only
        $filters = $this->getFilters();

        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        // Return MINIMAL data for instant page load - NO LIBRARIES
        return Inertia::render('SponsorUs', [
            'libraries' => [], // Empty - sponsor page doesn't need libraries
            'filters' => $filters,
            'filterType' => null,
            'filterValue' => null,
            'filterName' => null,
            'categoryData' => null,
            'userPlanLimits' => $userPlanLimits,
            'currentPlan' => $this->getCurrentPlan($user),
            'userLibraryIds' => $userLibraryIds,
            'viewedLibraryIds' => $viewedLibraryIds,
            'settings' => [
                'emails' => $settings->emails ?? [],
                'phones' => $settings->phones ?? [],
                'addresses' => $settings->addresses ?? [],
                'copyright_text' => $settings->copyright_text,
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
            ]
        ]);
    }

    /**
     * Store a new sponsor request.
     */
    public function store(SponsorRequest $request)
    {
        try {
            // Create sponsor record
            $sponsor = Sponsor::create([
                'name' => $request->name,
                'company_name' => $request->company_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'budget_range_min' => $request->budget_range_min,
                'budget_range_max' => $request->budget_range_max,
                'message' => $request->message,
                'sponsorship_goals' => $request->sponsorship_goals,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $adminEmailSent = false;
            $userEmailSent = false;

            // Send email to admin
            try {
                Mail::to(config('mail.admin_email'))
                    ->send(new SponsorFormMail($sponsor));
                $adminEmailSent = true;
            } catch (\Exception $e) {
                Log::error('Failed to send admin sponsorship email: ' . $e->getMessage());
            }

            // Send confirmation email to sponsor
            try {
                Mail::to($sponsor->email)
                    ->send(new SponsorFormMail($sponsor, true));
                $userEmailSent = true;
            } catch (\Exception $e) {
                Log::error('Failed to send sponsor confirmation email: ' . $e->getMessage());
            }

            // Return success if at least the sponsor record was saved
            // You can customize the message based on email statuses if needed
            if ($adminEmailSent || $userEmailSent) {
                return back()->with('success', 'Thank you for your sponsorship inquiry! We\'ll review your request and get back to you soon.');
            } else {
                // Both emails failed but sponsor is saved
                Log::warning('Sponsor saved but both emails failed to send. Sponsor ID: ' . $sponsor->id);
                return back()->with('success', 'Thank you for your sponsorship inquiry! We\'ll review your request and get back to you soon.');
            }

        } catch (\Exception $e) {
            Log::error('Sponsor form submission failed: ' . $e->getMessage());

            return back()->with('error', 'Sorry, there was an error sending your sponsorship request. Please try again.');
        }
    }

    /**
     * Get filters data for the Layout component - OPTIMIZED
     */
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(['id', 'name', 'slug']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'image']),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }
}
