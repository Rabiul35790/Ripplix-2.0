<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\Board;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Industry;
use App\Models\Interaction;
use App\Models\LibraryView;
use App\Models\Setting;
use App\Mail\ContactFormMail;
use App\Models\Library;
use App\Models\Platform;
use App\Notifications\NewContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Show the contact form.
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

        return Inertia::render('ContactUs', [
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
     * Store a new contact message.
     */
    public function store(ContactRequest $request)
    {
        try {
            // Create contact record
            $contact = Contact::create([
                'name' => $request->name,
                'email' => $request->email,
                'subject' => $request->subject,
                'message' => $request->message,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Send email to admin
            Mail::to(config('mail.admin_email'))
                ->send(new ContactFormMail($contact));


            // Send confirmation email to user
            Mail::to($contact->email)
                ->send(new ContactFormMail($contact, true));

            return back()->with('success', 'Thank you for your message! We\'ll get back to you soon.');

        } catch (\Exception $e) {
            Log::error('Contact form submission failed: ' . $e->getMessage());

            return back()->with('error', 'Sorry, there was an error sending your message. Please try again.');
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
