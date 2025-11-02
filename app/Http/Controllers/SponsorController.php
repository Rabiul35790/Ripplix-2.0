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
use App\Models\Library;
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
     * Show the sponsor form.
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

    public function index(Request $request)
    {
        $settings = Setting::getInstance();

        // Get libraries data similar to BrowseController
        $query = Library::with(['platforms', 'categories', 'industries', 'interactions'])
            ->where('is_active', true);

        $libraries = $query->latest()->get();
        $filters = $this->getFilters();

        $isAuthenticated = auth()->check();


        $viewedLibraryIds = $this->getViewedLibraryIds($request);

        $userPlanLimits = null;
        if ($isAuthenticated) {
            $userPlanLimits = $this->getUserPlanLimits(auth()->user());
        }

        $userLibraryIds = [];
        if ($isAuthenticated) {
            $userLibraryIds = Board::getUserLibraryIds(auth()->id());
        }

        return Inertia::render('SponsorUs', [
            'libraries' => $libraries,
            'filters' => $filters,
            'filterType' => null,
            'filterValue' => null,
            'filterName' => null,
            'categoryData' => null,
            'userPlanLimits' => $userPlanLimits,
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

            // Send email to admin

            Mail::to(config('mail.admin_email'))
                ->send(new SponsorFormMail($sponsor));


            // Send confirmation email to sponsor
            Mail::to($sponsor->email)
                ->send(new SponsorFormMail($sponsor, true));

            return back()->with('success', 'Thank you for your sponsorship inquiry! We\'ll review your request and get back to you soon.');

        } catch (\Exception $e) {
            Log::error('Sponsor form submission failed: ' . $e->getMessage());

            return back()->with('error', 'Sorry, there was an error sending your sponsorship request. Please try again.');
        }
    }

    /**
     * Get filters data for the Layout component
     */
    private function getFilters()
    {
        return [
            'platforms' => Platform::where('is_active', true)->get(),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'industries' => Industry::where('is_active', true)->orderBy('name')->get(),
            'interactions' => Interaction::where('is_active', true)->orderBy('name')->get(),
        ];
    }
}
