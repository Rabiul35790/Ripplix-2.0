<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Notifications\VerificationCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationCodeController extends Controller
{
    /**
     * Display the email verification form
     */
    public function show(): Response|RedirectResponse
    {
        $settings = Setting::getInstance();

        // Ensure user is fully loaded with fresh data
        $user = Auth::user();
        
        if (!$user) {
            Log::warning('User not found in session during verification show');
            return redirect()->route('login')->withErrors(['error' => 'Session expired. Please login again.']);
        }

        // Force refresh user data from database
        $user->refresh();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('home');
        }

        return Inertia::render('Auth/VerifyEmailCode', [
            'email' => $user->email,
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
     * Handle verification code submission
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        try {
            $user = Auth::user();

            if (!$user) {
                Log::warning('User not found in session during verification');
                return back()->withErrors(['code' => 'Session expired. Please try again.']);
            }

            // Force refresh to get latest data
            $user->refresh();

            if ($user->hasVerifiedEmail()) {
                return redirect()->route('home')->with('success', 'Email already verified!');
            }

            if (!$user->isVerificationCodeValid($request->code)) {
                return back()->withErrors(['code' => 'Invalid or expired verification code.']);
            }

            // Use transaction for verification
            DB::transaction(function () use ($user) {
                $user->markEmailAsVerified();
                $user->clearVerificationCode();
            });

            // Wait for transaction to commit
            usleep(100000); // 100ms

            return redirect()->route('home')->with('success', 'Email verified successfully!');
            
        } catch (\Exception $e) {
            Log::error('Verification error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['code' => 'Verification failed. Please try again.']);
        }
    }

    /**
     * Resend verification code
     */
    public function resend(Request $request): RedirectResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return redirect()->route('login')->withErrors(['error' => 'Session expired.']);
            }

            // Force refresh
            $user->refresh();

            if ($user->hasVerifiedEmail()) {
                return redirect()->route('home');
            }

            // Generate new code in transaction
            $code = DB::transaction(function () use ($user) {
                $code = $user->generateVerificationCode();
                $user->refresh();
                return $code;
            });

            // Wait for transaction
            usleep(50000); // 50ms

            // Send notification
            $user->notify(new VerificationCodeNotification($code));

            return back()->with('status', 'verification-code-sent');
            
        } catch (\Exception $e) {
            Log::error('Resend verification error: ' . $e->getMessage(), [
                'user_id' => Auth::id()
            ]);
            
            return back()->withErrors(['error' => 'Failed to resend code. Please try again.']);
        }
    }
}