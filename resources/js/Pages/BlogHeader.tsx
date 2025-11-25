import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import BrowseDropdown from './Website/Components/BrowseDropdown';
import ProfileModal from './ProfileModal';
import PricingModal from './PricingModal';
import SupportModal from './SupportModal';
import { Settings, MessageSquare, UserPlus } from 'lucide-react';
import axios from 'axios';
import { AnimatedGradientBorderStyles } from './PriceComponents/PricingCard';

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface CurrentPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  billing_period: string;
  expires_at?: string;
  days_until_expiry?: number;
}

interface Settings {
  logo?: string;
  copyright_text?: string;
}

interface BlogHeaderProps {
  auth: PageProps['auth'];
  ziggy?: PageProps['ziggy'];
  userPlanLimits?: UserPlanLimits | null;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  currentPlan?: CurrentPlan | null;
  settings?: Settings;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
  auth,
  filters,
  ziggy,
  userPlanLimits,
  currentPlan,
  settings
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrowseDropdownOpen, setIsBrowseDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth?.user || null);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  const logo = settings?.logo;

  // Fetch unread support count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadSupportCount();
      const interval = setInterval(fetchUnreadSupportCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadSupportCount = async () => {
    try {
      const response = await axios.get('/support/unread-count');
      setUnreadSupportCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread support count:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleBrowseDropdown = () => {
    setIsBrowseDropdownOpen(!isBrowseDropdownOpen);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleProfileModalOpen = () => {
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false);
  };

  const handlePricingModalOpen = () => {
    setIsPricingModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handlePricingModalClose = () => {
    setIsPricingModalOpen(false);
  };

  const handleSupportModalOpen = () => {
    setIsSupportModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSupportModalClose = () => {
    setIsSupportModalOpen(false);
    fetchUnreadSupportCount();
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    setAvatarError(false);
  };

  const handleLogout = () => {
    router.post('/logout', {}, {
      onSuccess: () => {
        router.get('/', {}, { replace: true });
      },
      onError: (errors) => {
        console.error('Logout error:', errors);
        router.get('/', {}, { replace: true });
      }
    });
  };

  const formatText = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

const getUnlockProButtonText = () => {
  if (!currentUser) {
    return { full: 'Unlock Pro', short: 'Pro' };
  }

  if (currentPlan?.billing_period === 'lifetime') {
    return { full: 'Lifetime Pro', short: 'Pro' };
  }

  if (currentPlan && currentPlan.price > 0) {
    if (
      currentPlan.days_until_expiry !== undefined &&
      currentPlan.days_until_expiry <= 7
    ) {
      return { full: 'Renew Pro', short: 'Renew' };
    }
    return {
      full: `Pro ${formatText(currentPlan.billing_period)}`,
      short: 'Pro'
    };
  }

  return { full: 'Unlock Pro', short: 'Pro' };
};


  const getUnlockProButtonStyle = () => {
    if (!currentUser) {
      return "animated-gradient-border-button-inner holographic-link2 bg-[#F2EDFF] dark:bg-gray-800 text-[#2B235A] dark:text-gray-300 border border-[#CECCFF] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700";
    }

    if (currentPlan?.billing_period === 'lifetime') {
      return "bg-[#F5F5FA] text-[#7F7F8A] pointer-events-none";
    }

    if (currentPlan && currentPlan.price > 0) {
      if (currentPlan.days_until_expiry !== undefined && currentPlan.days_until_expiry <= 7) {
        return "bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white hover:opacity-95";
      }
      return "bg-[#F5F5FA] text-[#7F7F8A] pointer-events-none";
    }

    return "holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none";
  };

  const buttonText = getUnlockProButtonText();
  const buttonStyle = getUnlockProButtonStyle();


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar]);

  // Update currentUser when auth.user changes
  useEffect(() => {
    setCurrentUser(auth?.user || null);
  }, [auth?.user]);

  const defaultFilters = {
    platforms: [],
    categories: [],
    industries: [],
    interactions: []
  };

  const shouldShowAvatar = currentUser?.avatar && !avatarError;

  console.log("Blog header button text",getUnlockProButtonText())
  console.log("Blog header limit", userPlanLimits)
  console.log("Blog header current",currentPlan)
  console.log("Blog header current expiry",currentPlan?.days_until_expiry)


  return (
    <>
      <header className="bg-white dark:bg-gray-900 px-4 sm:px-6 pb-4 sticky sticky:bg-white top-0 z-40 pt-4 sm:pt-6 font-sora">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 focus:outline-none">
              {logo ? (
                <img
                  src={logo}
                  alt="RippliX Logo"
                  className="h-8 max-w-[120px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center ${logo ? 'hidden' : ''}`}>
                <span className="text-white dark:text-black font-bold text-sm">R</span>
              </div>
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={browseRef}>
              <button
                onClick={toggleBrowseDropdown}
                className="bg-transparent border-none text-[#2B235A] dark:text-gray-300 font-medium outline-none focus:!outline-none focus:border-none text-sm lg:text-base flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Browse
                <svg
                  className={`ml-1 w-5 h-5 transition-transform ${isBrowseDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <BrowseDropdown
                isOpen={isBrowseDropdownOpen}
                onClose={() => setIsBrowseDropdownOpen(false)}
                filters={filters || defaultFilters}
              />
            </div>

            <div>
              <a
                href="https://plugin.ripplix.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-[#2B235A] dark:text-gray-300 font-bold hover:opacity-100 dark:hover:text-[#E0DAC8] outline-none focus:outline-none transition-colors text-sm lg:text-base whitespace-nowrap duration-500"
              >
                <span className="opacity-80 hover:opacity-100 transition-opacity">
                  Figma Plugin
                </span>
              </a>
            </div>

            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              New
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Unlock Pro button */}
            <div className="animated-gradient-border-button">
              <button
                onClick={handlePricingModalOpen}
                className={`px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] transition-colors text-sm whitespace-nowrap outline-none focus:outline-none duration-500 ${buttonStyle}`}
              >
                <span className="hidden sm:inline">{buttonText.full}</span>
                <span className="sm:hidden">{buttonText.short}</span>
              </button>
            </div>

            {/* Conditional rendering based on authentication */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="bg-[#E6E7F3] dark:bg-gray-800 text-[#443B82] dark:text-gray-300 p-2 rounded-3xl border outline-none focus:outline-none border-[#CECCFF] dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 overflow-hidden"
                >
                  {shouldShowAvatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={handleAvatarError}
                    />
                  ) : (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#F7F7FC] dark:bg-gray-800 rounded-lg shadow-lg border border-[#B7B3FF] dark:border-gray-700 z-50 outline-none focus:outline-none">
                    <div className="p-[6px]">
                      <div className="px-4 py-2 text-sm text-[#2B235A] dark:text-gray-300 border-b border-[#E3E2FF] dark:border-gray-700">
                        <div className="font-medium truncate">{currentUser.name}</div>
                        <div className="text-[#9D9DA8] dark:text-gray-400 text-xs truncate">{currentUser.email}</div>
                      </div>
                      <div className='border-b border-[#E3E2FF] dark:border-gray-700'>
                        <button
                          onClick={handleProfileModalOpen}
                          className="w-full text-left block px-2 !py-[6px] mt-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                        >
                          <div className="flex items-center mb-1">
                            <span className="bg-[#F5F5FA] border border-[#E3E2FF] text-[#2B235A] p-2 rounded-md mr-2">
                              <Settings className='w-4 h-4 '/>
                            </span>
                            <span className="font-medium text-[#2B235A] ">Settings</span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs ml-10">
                            Manage your Profile and account
                          </div>
                        </button>

                        <button
                          onClick={handleSupportModalOpen}
                          className="w-full text-left block px-2 !py-[6px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                        >
                          <div className="flex items-center mb-1">
                            <span className="bg-[#F5F5FA] border border-[#E3E2FF] text-[#2B235A] p-2 rounded-md mr-2">
                              <MessageSquare className='w-4 h-4'/>
                            </span>
                            <span className="font-medium text-[#2B235A]">Support</span>
                            {unreadSupportCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">
                                {unreadSupportCount}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs ml-10">
                            Get help and submit tickets
                          </div>
                        </button>

                        <button
                          onClick={handlePricingModalOpen}
                          className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                        >
                          <div className="flex items-center mb-1">
                            <span className="bg-[#F5F5FA] border border-[#E3E2FF] text-[#2B235A] p-2 rounded-md mr-2">
                              <UserPlus className='w-4 h-4'/>
                            </span>
                            <span className="font-medium text-[#2B235A]">Membership</span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs ml-10">
                            Become a Premium Member
                          </div>
                        </button>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 mt-[3px] text-sm text-[#2B235A] dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 transition-colors flex items-center outline-none focus:outline-none"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
              >
                <span className="hidden sm:inline">Join Now</span>
                <span className="sm:hidden">Join</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <button
                onClick={toggleBrowseDropdown}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-[#2B235A] dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span>Browse</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isBrowseDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <a
                href="https://plugin.ripplix.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B235A] dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 flex items-center justify-between border border-gray-200 dark:border-gray-600 rounded-lg px-3"
              >
                <span>Figma Plugin</span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium outline-none focus:outline-none">
                  New
                </span>
              </a>

              {/* Mobile Support Option - only show if authenticated */}
              {currentUser && (
                <button
                  onClick={handleSupportModalOpen}
                  className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 flex items-center justify-between border border-gray-200 dark:border-gray-600 rounded-lg px-3"
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Support</span>
                  </div>
                  {unreadSupportCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadSupportCount}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Auth Links - only show if not authenticated */}
              {!currentUser && (
                <div className="flex flex-col space-y-2">
                  <Link
                    href={route('login')}
                    className={`px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] transition-colors text-sm whitespace-nowrap outline-none focus:outline-none duration-500 text-center ${buttonStyle}`}
                  >
                    Log in
                  </Link>
                  <Link
                    href={route('register')}
                    className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none text-center"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleProfileModalClose}
        auth={{ user: currentUser }}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={handlePricingModalClose}
        isAuthenticated={!!currentUser}
      />

      {/* Support Modal */}
      {currentUser && (
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={handleSupportModalClose}
          auth={{ user: currentUser }}
        />
      )}
    </>
  );
};

export default BlogHeader;
