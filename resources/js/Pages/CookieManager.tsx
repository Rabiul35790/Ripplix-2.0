import { useState, useEffect } from 'react';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export default function CookieManager() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already set preferences
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            setShowBanner(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        // Hide banner IMMEDIATELY
        setShowBanner(false);
        // Save preferences in background
        saveCookiePreferencesAsync(allAccepted, true);
    };

    const handleRejectAll = () => {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        // Hide banner IMMEDIATELY
        setShowBanner(false);
        // Save preferences in background
        saveCookiePreferencesAsync(onlyNecessary, false);
    };

    const saveCookiePreferencesAsync = (prefs: CookiePreferences, accepted: boolean) => {
        // Save to localStorage immediately (synchronous)
        localStorage.setItem('cookieConsent', JSON.stringify(prefs));

        // Send to backend asynchronously (fire and forget)
        fetch('/api/cookies/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                preferences: prefs,
                accepted: accepted,
            }),
        }).catch(error => {
            console.error('Failed to save cookie preferences to server:', error);
            // User won't see this error since banner is already gone
            // Preferences are still saved in localStorage
        });
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 font-sora px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            {/* Cookie Banner Container */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#180A40] rounded-lg sm:rounded-xl shadow-2xl">
                    <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                        <div className="flex flex-col gap-4">
                            {/* Top Section: Icon + Text */}
                            <div className="flex items-start gap-3 sm:gap-4">
                                {/* Cookie Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#2B1D52] flex items-center justify-center shadow-md">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#DE814B]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 11-2 0 1 1 0 012 0zm4-3a1 1 0 11-2 0 1 1 0 012 0zm2 6a1 1 0 11-2 0 1 1 0 012 0z"/>
                                        </svg>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                                        <span className="font-bold block sm:inline mb-1 sm:mb-0">
                                            Our website uses cookies to enhance your browsing experience.{' '}
                                        </span>
                                        <span className="block sm:inline">
                                            By continuing to use our site, you consent to the use of cookies in accordance with our practices, as outlined in our{' '}
                                        </span>
                                        <a
                                            href="/privacy"
                                            className="text-white underline hover:opacity-90 transition-opacity duration-300 font-medium inline-block"
                                        >
                                            Privacy Policy
                                        </a>
                                        <span className="inline">.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:ml-14 md:ml-16">
                                <button
                                    onClick={handleRejectAll}
                                    className="w-full sm:w-auto sm:flex-1 md:flex-none whitespace-nowrap text-white border border-white/20 hover:border-white/40 px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 rounded-md text-sm sm:text-sm md:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                                >
                                    Reject all
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="w-full sm:w-auto sm:flex-1 md:flex-none whitespace-nowrap bg-white hover:bg-gray-100 text-[#180A40] px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 rounded-md text-sm sm:text-sm md:text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                                >
                                    Accept all
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
