<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $settings = Setting::getInstance();
        return Inertia::render('Auth/Register', [
            'settings' => [
                'logo' => $settings->logo ? asset('storage/' . $settings->logo) : null,
                'favicon' => $settings->favicon ? asset('storage/' . $settings->favicon) : null,
                'authentication_page_image' => $settings->authentication_page_image ? asset('storage/' . $settings->authentication_page_image) : null,
            ]
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            // Wrap everything in a database transaction
            $user = DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                // Generate verification code within transaction
                $code = $user->generateVerificationCode();

                // Refresh to ensure we have the latest data
                $user->refresh();

                return $user;
            });

            // Wait for transaction to fully commit
            usleep(100000); // 100ms delay to ensure DB commit

            // Send verification email after transaction commits
            try {
                $user->notify(new \App\Notifications\VerificationCodeNotification($user->verification_code));
            } catch (\Exception $e) {
                Log::error('Failed to send verification email: ' . $e->getMessage());
                // Don't fail registration if email fails
            }

            // Login user with explicit session regeneration
            Auth::login($user, true);

            // Explicitly regenerate session and wait
            $request->session()->regenerate();
            $request->session()->save(); // Force session save

            // Small delay to ensure session is written
            usleep(50000); // 50ms

            // Redirect to verification page
            return redirect()->route('verification.code.show')
                ->with('status', 'verification-code-sent');

        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'email' => 'Registration failed. Please try again.'
            ])->withInput($request->except('password', 'password_confirmation'));
        }
    }
}
