import { useState, useEffect } from 'react';
import axios from 'axios';

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

    const handleAcceptAll = async () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        await saveCookiePreferences(allAccepted, true);
    };

    const handleRejectAll = async () => {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        await saveCookiePreferences(onlyNecessary, false);
    };

    const saveCookiePreferences = async (prefs: CookiePreferences, accepted: boolean) => {
        try {
            // Save to backend
            await axios.post('/api/cookies/store', {
                preferences: prefs,
                accepted: accepted,
            });

            // Save to localStorage
            localStorage.setItem('cookieConsent', JSON.stringify(prefs));
            setShowBanner(false);
        } catch (error) {
            console.error('Failed to save cookie preferences:', error);
        }
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 font-sora px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {/* Cookie Banner Container */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#180A40] rounded-lg">
                    <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                            {/* Cookie Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2B1D52] flex items-center justify-center shadow-md">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#DE814B]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 11-2 0 1 1 0 012 0zm4-3a1 1 0 11-2 0 1 1 0 012 0zm2 6a1 1 0 11-2 0 1 1 0 012 0z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 w-full sm:w-auto sm:pr-4">
                                <p className="text-white text-xs sm:text-xs md:text-sm leading-relaxed">
                                   <span className='font-bold'> Our website uses cookies to enhance your browsing experience.{' '}</span>
                                    <span className="inline">By continuing to use our site, you consent to the use of cookies in accordance with our practices, as outlined in our{' '}</span>
                                    <a
                                        href="/privacy"
                                        className="text-white underline hover:opacity-90 transition-opacity duration-500 font-medium whitespace-nowrap"
                                    >
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-row gap-2.5 sm:gap-3 w-full sm:w-auto sm:flex-shrink-0">
                                <button
                                    onClick={handleRejectAll}
                                    className="flex-1 sm:flex-none whitespace-nowrap text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm md:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-0"
                                >
                                    Reject all
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 sm:flex-none whitespace-nowrap holographic-link bg-white hover:opacity-90 text-[#2B235A] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm md:text-base font-medium transition-all duration-500 focus:outline-none focus:ring-0"
                                >
                                    <span className='z-10'>
                                        Accept all
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
