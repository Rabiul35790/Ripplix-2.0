<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        $settings = Setting::getInstance();

        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'settings' => [
                'emails' => $settings->emails ?? [],
                'phones' => $settings->phones ?? [],
                'addresses' => $settings->addresses ?? [],
                'copyright_text' => $settings->copyright_text,
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/' . $settings->favicon) : null,
                'authentication_page_image' => $settings->authentication_page_image ? asset('storage/' . $settings->authentication_page_image) : null,
            ]
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            // Send the password reset link
            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status == Password::RESET_LINK_SENT) {
                return redirect()->back()->with('status', __($status));
            }

            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Password reset error: ' . $e->getMessage());

            throw ValidationException::withMessages([
                'email' => ['An error occurred while sending the reset link. Please try again.'],
            ]);
        }
    }
}
