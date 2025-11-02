import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import BrowseDropdown from './Website/Components/BrowseDropdown';
import SearchModal from './SearchModal';
import ProfileModal from './ProfileModal';
import PricingModal from './PricingModal';
import SupportModal from './SupportModal';
import { Settings, MessageSquare, LucideBookUser, UserPlus } from 'lucide-react';
import axios from 'axios';
import PricingCard, { AnimatedGradientBorderStyles } from './PriceComponents/PricingCard';

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

interface Library {
  id: number;
  title: string;
  slug: string;
  url: string;
  video_url: string;
  description?: string;
  logo?: string;
  platforms: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string; image?: string }>;
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  created_at: string;
  published_date:string;
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

interface HeaderProps {
  libraries: Library[];
  onSearch: (query: string) => void;
  searchQuery: string;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
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
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchQuery,
  auth,
  filters,
  libraries,
  ziggy,
  userPlanLimits,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onLibraryViewed,
  currentPlan
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
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

  // Fetch unread support count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadSupportCount();
      // Set up interval to check for new support messages every 30 seconds
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleSearchInputClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleSearchChange = (newQuery: string) => {
    setQuery(newQuery);
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
    // Refresh unread count when closing support modal
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

  const getUnlockProButtonText = () => {
    if (!currentUser) {
      return { full: 'Unlock Pro', short: 'Pro' };
    }

    if (currentPlan?.billing_period === 'lifetime') {
      return { full: 'Lifetime Pro', short: 'Pro' };
    }

    if (currentPlan && currentPlan.price > 0) {
      if (currentPlan.days_until_expiry !== undefined && currentPlan.days_until_expiry <= 7) {
        return { full: 'Renew Pro', short: 'Renew' };
      }
      return { full: 'Manage Pro', short: 'Pro' };
    }

    return { full: 'Unlock Pro', short: 'Pro' };
  };

  const getUnlockProButtonStyle = () => {
    if (!currentUser) {
      return "animated-gradient-border-button-inner holographic-link2 bg-[#F2EDFF] dark:bg-gray-800 text-[#2B235A] dark:text-gray-300 border border-[#CECCFF] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700";
    }

    if (currentPlan?.billing_period === 'lifetime') {
      return "bg-purple-600 text-white hover:bg-purple-700 shadow-lg";
    }

    if (currentPlan && currentPlan.price > 0) {
      if (currentPlan.days_until_expiry !== undefined && currentPlan.days_until_expiry <= 7) {
        return "bg-orange-500 text-white hover:bg-orange-600 animate-pulse";
      }
      return "bg-green-600 text-white hover:bg-green-700";
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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

  return (
    <>
    <AnimatedGradientBorderStyles />
      <header className="bg-white dark:bg-gray-900 px-4 sm:px-6 pb-4 sticky sticky:bg-white top-0 z-40 pt-4 sm:pt-6 font-sora">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile Plugin Link */}
            <div className="md:hidden flex items-center space-x-2 ml-6">
                <div className="relative" ref={browseRef}>
                <button
                  onClick={toggleBrowseDropdown}
                  className="bg-transparent border-none text-[#2B235A] dark:text-gray-300 font-medium focus:!outline-none focus:border-none text-sm lg:text-base flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Browse
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${isBrowseDropdownOpen ? 'rotate-180' : ''}`}
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
              <a
                href="https://plugin.ripplix.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-[#564638] dark:hover:text-blue-400 transition-colors text-sm whitespace-nowrap"
              >
                Plugin
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 ml-6">
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
          </div>

          {/* Center - Search (Desktop) */}
            <div className="hidden sm:flex flex-1 max-w-xs sm:max-w-md lg:max-w-2xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#2B235A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </div>
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={handleSearchInputClick}
                placeholder="Try searching 'Hover Effect'"
                className="w-full pl-8 sm:pl-10 pr-12 sm:pr-16 py-2 bg-[#F5F5FA] dark:bg-gray-800 border border-[#CECCFF] dark:border-[#E0DAC8] rounded-lg focus:outline-none focus:ring-0 focus:border-[#E0DAC8] dark:focus:border-[#E0DAC8] outline-none ring-0 text-gray-900 dark:text-white placeholder-[#2B235A] dark:placeholder-gray-400 cursor-pointer text-sm"
                style={{ outline: 'none', boxShadow: 'none' }}
                readOnly
                />
                <button
                type="button"
                onClick={handleSearchInputClick}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                <kbd className="hidden sm:inline-block bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded text-xs">
                    ⌘K
                </kbd>
                </button>
            </form>
            </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={handleSearchInputClick}
              className="sm:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Unlock Pro button - now opens pricing modal */}
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
              // User is authenticated - show profile icon/avatar with dropdown
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
                        {/* {currentPlan && (
                          <div className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                            {currentPlan.name}
                            {currentPlan.expires_at && currentPlan.days_until_expiry !== undefined && (
                              <span className="ml-1">
                                • {currentPlan.days_until_expiry <= 0 ? 'Expired' : `${currentPlan.days_until_expiry}d left`}
                              </span>
                            )}
                          </div>
                        )} */}
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
                    className=" holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
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
                    className={`px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] transition-colors text-sm whitespace-nowrap outline-none focus:outline-none duration-500 ${buttonStyle}`}
                  >
                    Log in
                  </Link>
                  <Link
                    href={route('register')}
                    className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal
        libraries={libraries}
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        searchQuery={query}
        onSearchChange={handleSearchChange}
        filters={filters || defaultFilters}
        auth={{ user: currentUser }}
        userLibraryIds={userLibraryIds}
        userPlanLimits={userPlanLimits}
        viewedLibraryIds={viewedLibraryIds} // ADD THIS
        onLibraryViewed={onLibraryViewed}
      />

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

export default Header;
