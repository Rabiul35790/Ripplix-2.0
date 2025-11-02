<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PricingPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                Auth::login($user);

                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }
            } else {
                $user = $this->createUser($googleUser);
                Auth::login($user);
            }

            return redirect()->intended('/')->with('success', 'Successfully logged in with Google!');

        } catch (Exception $e) {
            Log::error('Google OAuth Error: ' . $e->getMessage());

            return redirect()->route('login')->with('error', 'Something went wrong with Google authentication. Please try again.');
        }
    }

    /**
     * Create a new user from Google data
     */
    private function createUser($googleUser): User
    {
        // Get free member plan
        $freeMemberPlan = PricingPlan::where('slug', 'free-member')->first();

        $user = User::create([
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
            'email_verified_at' => now(), // Google accounts are pre-verified
            'password' => Hash::make(Str::random(24)), // Random password
            'is_active' => true,
            'pricing_plan_id' => $freeMemberPlan ? $freeMemberPlan->id : null,
        ]);

        return $user;
    }
}
