import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { BookOpen, Target, Smartphone, Zap, FolderOpen, User, Phone, Heart, Command, Star, Navigation, SquareMousePointer, Building2, Settings as SettingsIcon, MessageSquare, UserPlus } from 'lucide-react';
import GoogleAdSlot from '@/Components/GoogleAdSlot';
import axios from 'axios';

interface Sidebar2Props {
  currentRoute: string;
  auth: PageProps['auth'];
  ziggy?: PageProps['ziggy'];
  onMobileItemAction?: () => void;
  onOpenProfileModal?: () => void;
  onOpenSupportModal?: () => void;
  onOpenPricingModal?: () => void;
}

interface Settings {
  logo: string;
  copyright_text: string;
}

interface ExtendedPageProps extends PageProps {
  settings?: Settings;
  currentPlan?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_period: string;
    expires_at?: string;
    days_until_expiry?: number;
  } | null;
}


interface Ad {
  id: number;
  title: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  media_url: string;
  target_url: string;
}

interface MenuItem {
  name: string;
  route: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  authRequired?: boolean;
}

const Sidebar2: React.FC<Sidebar2Props> = ({
  currentRoute,
  auth,
  onMobileItemAction,
  onOpenProfileModal,
  onOpenSupportModal,
  onOpenPricingModal,
}) => {
  const [sidebarAd, setSidebarAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  const { url, props } = usePage<ExtendedPageProps>();

  // Sliding indicator state
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<React.CSSProperties>({});
  const workspaceNavRef = useRef<HTMLDivElement>(null);
  const quickLinksNavRef = useRef<HTMLDivElement>(null);
  const aboutLinksNavRef = useRef<HTMLDivElement>(null);

  const copyright_text = props?.settings?.copyright_text || null;
  const logo = props?.settings?.logo || null;
  const currentPlan = props?.currentPlan || null;
  const [currentUser, setCurrentUser] = useState(auth?.user || null);
  const [avatarError, setAvatarError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adSettings = props?.adSettings;
  const canShowAds = adSettings?.can_show_ads !== false;
  const useGoogleAds = Boolean(
    canShowAds &&
    adSettings?.enabled &&
    adSettings?.client &&
    adSettings?.slots?.sidebar
  );

  useEffect(() => {
    if (!canShowAds || useGoogleAds) {
      setSidebarAd(null);
      setIsLoadingAd(false);
      return;
    }

    const fetchSidebarAd = async () => {
      try {
        setIsLoadingAd(true);
        const response = await fetch(`/ads/sidebar?t=${Date.now()}`);
        const result = await response.json();

        if (result.success && result.data && result.data !== null) {
          setSidebarAd(result.data);
        } else {
          setSidebarAd(null);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar ad:', error);
        setSidebarAd(null);
      } finally {
        setIsLoadingAd(false);
      }
    };

    fetchSidebarAd();
  }, [canShowAds, useGoogleAds]);

  useEffect(() => {
    setCurrentUser(auth?.user || null);
  }, [auth?.user]);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar]);

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

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnreadSupportCount = async () => {
      try {
        const response = await axios.get('/support/unread-count');
        setUnreadSupportCount(response.data.count);
      } catch {
        setUnreadSupportCount(0);
      }
    };
    fetchUnreadSupportCount();
    const interval = setInterval(fetchUnreadSupportCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const formatText = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

  const getUnlockProButtonText = () => {
    if (!currentUser) {
      return { full: 'Unlock Pro', short: 'Pro' };
    }

    if (currentPlan?.billing_period === 'lifetime') {
      return { full: 'Lifetime Pro', short: 'Pro' };
    }

    if (currentPlan && currentPlan.price > 0) {
      return {
        full: `Pro ${formatText(currentPlan.billing_period)}`,
        short: 'Pro'
      };
    }

    return { full: 'Unlock Pro', short: 'Pro' };
  };

  const getUnlockProButtonStyle = () => {
    if (!currentUser) {
      return "bg-[#F2EDFF] dark:bg-gray-800 text-[#2B235A] dark:text-gray-300 border border-[#CECCFF] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700";
    }

    if (currentPlan?.billing_period === 'lifetime') {
      return "bg-[#F5F5FA] text-[#7F7F8A] pointer-events-none";
    }

    if (currentPlan && currentPlan.price > 0) {
      return "bg-[#F5F5FA] text-[#7F7F8A] pointer-events-none";
    }

    return "holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white hover:opacity-95";
  };

  const handleLogout = () => {
    onMobileItemAction?.();
    router.post('/logout', {}, {
      onSuccess: () => router.get('/', {}, { replace: true }),
      onError: () => router.get('/', {}, { replace: true }),
    });
  };

  const shouldShowAvatar = currentUser?.avatar && !avatarError;
  const buttonText = getUnlockProButtonText();
  const buttonStyle = getUnlockProButtonStyle();

  // Update sliding indicator position
  useEffect(() => {
    const updateIndicatorPosition = () => {
      // Find the active link across all navigation sections
      const allNavs = [workspaceNavRef.current, quickLinksNavRef.current, aboutLinksNavRef.current];

      for (const navRef of allNavs) {
        if (!navRef) continue;

        const activeLink = navRef.querySelector('[data-active="true"]') as HTMLElement;
        if (activeLink) {
          const navRect = navRef.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();

          setActiveIndicatorStyle({
            opacity: 1,
            top: `${activeLink.offsetTop}px`,
            height: `${linkRect.height}px`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          });
          return;
        }
      }

      // No active link found
      setActiveIndicatorStyle({ opacity: 0 });
    };

    // Update position after component renders
    const timeoutId = setTimeout(updateIndicatorPosition, 50);

    return () => clearTimeout(timeoutId);
  }, [url, currentRoute]);

  const trackAdClick = async (adId: number) => {
    try {
      await fetch(`/ads/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  const handleAdClick = (ad: Ad) => {
    trackAdClick(ad.id);
    window.open(ad.target_url, '_blank');
  };

  const menuItems: MenuItem[] = [
      {
        name: 'Explore',
        route: 'explore',
        icon: Navigation,
        iconBg: 'bg-[#EAD3FF] dark:bg-orange-900/30',
        iconColor: 'text-[#B16FF3] dark:text-orange-400'
      },
      {
        name: 'Collections',
        route: 'collections',
        icon: FolderOpen,
        iconBg: 'bg-[#FFD5E4] dark:bg-blue-900/30',
        iconColor: 'text-[#F772A2] dark:text-blue-400'
      },
      {
        name: 'Following',
        route: 'following',
        icon: Star,
        iconBg: 'bg-[#CDE7FF] dark:bg-purple-900/30',
        iconColor: 'text-[#61B2FF] dark:text-purple-400',
      },
    ];

    const quickLinks: MenuItem[] = [
      {
        name: 'All Apps',
        route: 'all-apps',
        icon: Command,
        iconBg: 'bg-[#EBF5C8] dark:bg-orange-900/30',
        iconColor: 'text-[#ADCE3A] dark:text-orange-400'
      },
      {
        name: 'All Elements',
        route: 'all-elements',
        icon: SquareMousePointer,
        iconBg: 'bg-[#C7F6FF] dark:bg-purple-900/30',
        iconColor: 'text-[#46D0EB] dark:text-purple-400'
      },
      {
        name: 'All Industries',
        route: 'all-categories',
        icon: Building2,
        iconBg: 'bg-[#FAD9FF] dark:bg-blue-900/30',
        iconColor: 'text-[#D669E6] dark:text-blue-400'
      },
    ];

    const aboutLinks: MenuItem[] = [
      {
        name: 'Curators',
        route: 'about-us',
        icon: User,
        iconBg: 'bg-[#FFDCCC] dark:bg-orange-900/30',
        iconColor: 'text-[#F27E49] dark:text-orange-400'
      },
      {
        name: 'Contact Us',
        route: 'contact-us',
        icon: Phone,
        iconBg: 'bg-[#FFC7E0] dark:bg-purple-900/30',
        iconColor: 'text-[#DE5290] dark:text-purple-400'
      },
      {
        name: 'Sponsor Us',
        route: 'sponsor-us',
        icon: Heart,
        iconBg: 'bg-[#D4FFE3] dark:bg-pink-900/30',
        iconColor: 'text-[#40C26C] dark:text-pink-400'
      },
    ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.authRequired && !auth.user) {
      return false;
    }
    return true;
  });

  const isActive = (route: string) => {
    if (route === '' || route === '/' || route === 'explore') {
      return url === '/' ||
             currentRoute === '/' ||
             currentRoute === '' ||
             currentRoute === 'explore' ||
             url === '/explore';
    }

    const routeWithSlash = route.startsWith('/') ? route : `/${route}`;
    const routeWithoutSlash = route.startsWith('/') ? route.substring(1) : route;

    return url === routeWithSlash ||
           currentRoute === routeWithSlash ||
           currentRoute === routeWithoutSlash ||
           url === `/${routeWithoutSlash}`;
  };

  const getRouteHref = (route: string) => {
    if (route === 'explore') {
      return '/';
    }
    if (route === '' || route === '/') {
      return '/';
    }
    return `/${route}`;
  };

  const renderNavSection = (
    items: MenuItem[],
    navRef: React.RefObject<HTMLDivElement>,
    sectionKey: string
  ) => (
    <div className="relative" ref={navRef}>
      {/* Sliding Active Indicator */}
      <div
        className="absolute left-0 w-full pointer-events-none z-0"
        style={{
          ...activeIndicatorStyle,
          background: '',
          borderRadius: '0.5rem',
        }}
      />

      <nav className="space-y-1 relative z-10">
        {items.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);

          return (
            <Link
              key={item.name}
              href={getRouteHref(item.route)}
              data-active={active}
              onClick={() => onMobileItemAction?.()}
              className={`flex items-center justify-between px-3 py-2 rounded-lg group focus:outline-none transition-colors duration-200 ${
                active
                  ? 'text-[#443B82] dark:text-white !bg-[linear-gradient(90deg,_#F8F8F9_33.59%,_rgba(255,255,255,0)_114.25%)]'
                  : 'text-[#443B82] dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <span
                className={`font-medium text-sm transition-all duration-200 ${
                  active ? '!font-bold' : ''
                }`}
              >
                {item.name}
              </span>
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center ${item.iconBg} flex-shrink-0 transition-all duration-200`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${item.iconColor} transition-all duration-200`} />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
    <div className="bg-off-white rounded-t-md dark:bg-gray-900 h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Mobile Top Actions */}
        <div className="lg:hidden px-5 pt-6 pb-4 dark:border-gray-700">
          {currentUser ? (
            <div className="flex items-center justify-end gap-1.5" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (onOpenPricingModal) {
                    onOpenPricingModal();
                  }
                }}
                className={`px-3 py-2 rounded-[4px] !font-sora !font-medium text-sm transition-colors whitespace-nowrap outline-none focus:outline-none ${buttonStyle}`}
              >
                {buttonText.full}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="bg-[#E6E7F3] dark:bg-gray-800 text-[#443B82] dark:text-gray-300 p-2 rounded-3xl border outline-none focus:outline-none border-[#CECCFF] dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center justify-center w-10 h-10 overflow-hidden"
                >
                  {shouldShowAvatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[13rem] max-w-[calc(100vw-3rem)] bg-[#F7F7FC] dark:bg-gray-800 rounded-lg shadow-lg border border-[#B7B3FF] dark:border-gray-700 z-[95] outline-none focus:outline-none">
                    <div className="p-[6px]">
                      <div className="px-4 py-2 text-sm text-[#2B235A] dark:text-gray-300 border-b border-[#E3E2FF] dark:border-gray-700">
                        <div className="font-medium truncate">{currentUser.name}</div>
                        <div className="text-[#9D9DA8] dark:text-gray-400 text-xs truncate">{currentUser.email}</div>
                      </div>

                      <div className='border-b border-[#E3E2FF] dark:border-gray-700'>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenProfileModal?.();
                          }}
                          className="w-full text-left block px-2 !py-[6px] mt-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                        >
                          <div className="flex items-center mb-1">
                            <span className="bg-[#F5F5FA] border border-[#E3E2FF] text-[#2B235A] p-2 rounded-md mr-2">
                              <SettingsIcon className='w-4 h-4'/>
                            </span>
                            <span className="font-medium text-[#2B235A]">Settings</span>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenSupportModal?.();
                          }}
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
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenPricingModal?.();
                          }}
                          className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                        >
                          <div className="flex items-center mb-1">
                            <span className="bg-[#F5F5FA] border border-[#E3E2FF] text-[#2B235A] p-2 rounded-md mr-2">
                              <UserPlus className='w-4 h-4'/>
                            </span>
                            <span className="font-medium text-[#2B235A]">Membership</span>
                          </div>
                        </button>
                        <div className='border-t border-[#E3E2FF] dark:border-gray-700 py-2 pl-2'>
                          <Link
                            href={'/blog'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Blog</span>
                            </div>
                          </Link>
                          <Link
                            href={'/payment-management'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Payment Management</span>
                            </div>
                          </Link>
                          <Link
                            href={'/privacy'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Privacy Policy</span>
                            </div>
                          </Link>
                          <Link
                            href={'/terms'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Terms of Service</span>
                            </div>
                          </Link>
                          <Link
                            href={'/cookie-policy'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Cookie Policy</span>
                            </div>
                          </Link>
                          <Link
                            href={'/disclaimer'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Disclaimer</span>
                            </div>
                          </Link>
                          <Link
                            href={'/report-content-policy'}
                            onClick={() => onMobileItemAction?.()}
                            className="w-full text-left block px-2 !py-[6px] mb-[3px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 focus:outline-none focus:ring-0 transition-colors duration-500"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-[#2B235A]">Report Content Policy</span>
                            </div>
                          </Link>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 mt-[3px] text-sm text-[#2B235A] dark:text-gray-300 hover:bg-white rounded-lg dark:hover:bg-gray-700 transition-colors flex items-center outline-none focus:outline-none"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenPricingModal?.()}
                className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 py-2 rounded-[4px] !font-sora !font-medium text-sm hover:opacity-95 transition-opacity whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
              >
                Unlock Pro
              </button>
              <Link
                href="/register"
                onClick={() => onMobileItemAction?.()}
                className="bg-[#F2EDFF] text-[#2B235A] border border-[#CECCFF] px-3 py-2 rounded-[4px] !font-sora !font-medium text-sm hover:bg-[#ECE6FF] transition-colors whitespace-nowrap outline-none focus:outline-none"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-5 pt-6">
          {/* Workspace */}
          <div className="mb-4 font-sora">
            <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
              Workspace
            </div>
            {renderNavSection(filteredMenuItems, workspaceNavRef, 'workspace')}
          </div>

          {/* Quick Links */}
          <div className="mb-4 font-sora">
            <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
              Quick Links
            </div>
            {renderNavSection(quickLinks, quickLinksNavRef, 'quicklinks')}
          </div>

          {/* About */}
          <div className="mb-4 font-sora">
            <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
              About
            </div>
            {renderNavSection(aboutLinks, aboutLinksNavRef, 'about')}
          </div>

          {/* Dynamic Advertisement Section */}
          {canShowAds && (
            <div className="px-5 mt-10 font-sora">
              {useGoogleAds ? (
                <div className="max-w-[192px] rounded-lg overflow-hidden border border-[#CECCFF] p-2">
                  <GoogleAdSlot
                    client={adSettings?.client as string}
                    slot={adSettings?.slots?.sidebar as string}
                    style={{ display: 'inline-block', width: '192px', height: '193px' }}
                    responsive={false}
                  />
                </div>
              ) : isLoadingAd ? (
              <div className="max-h-[193px] max-w-[192px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                <div className="h-[193px] w-[192px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ) : sidebarAd ? (
              <button
                onClick={() => handleAdClick(sidebarAd)}
                className="relative max-h-[193px] max-w-[192px] block hover:opacity-90 transition-opacity focus:outline-none outline-none rounded-lg overflow-hidden"
              >
                {/* Sponsor label */}
                <span className="absolute top-2 left-2 bg-[#2B235A] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md dark:bg-orange-500/80">
                  Sponsor
                </span>

                {sidebarAd.media_type === 'video' ? (
                  <video
                    src={sidebarAd.video_url || ''}
                    className="rounded-lg max-h-[193px] max-w-[192px] object-cover w-full h-full"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <img
                    src={sidebarAd.image_url || ''}
                    alt={sidebarAd.title}
                    className="rounded-lg max-h-[193px] max-w-[192px] object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
              </button>
            ) : (
              <div className="max-h-[193px] max-w-[192px] dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-[#CECCFF] dark:border-orange-800 relative">
                <div className="text-center">
                  <div className="w-8 h-8 bg-[#CECCFF] dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-4 h-4 text-[#2B235A] dark:text-orange-400" />
                  </div>
                  <p className="text-xs text-[#2B235A] opacity-75 dark:text-gray-300 mb-2 font-medium">
                    Want to advertise here?
                  </p>
                  <Link
                    href="/contact-us"
                    className="text-xs font-semibold text-[#2B235A] hover:font-bold dark:text-orange-400 dark:hover:text-orange-300 outline-none focus:outline-none underline transition duration-500"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Space for Copyright and Terms/Privacy Links */}
        <div className="mt-auto p-4 pt-4 mb-8 font-sora">
          <div className="text-xs text-[#443B82] dark:text-gray-400 space-y-1.5">
            <div className="text-center">
              {copyright_text ? (
                <p>{copyright_text}</p>
              ) : null}
            </div>
            <div className="flex justify-center space-x-4 font-semibold text-xs ">
                <Link href="/terms" className="hover:opacity-80 outline-none focus:outline-none focus:ring-0 dark:hover:text-gray-300 transition-opacity duration-500">
                    Terms
                </Link>
                <Link href="/privacy" className="hover:opacity-80 outline-none focus:outline-none focus:ring-0 dark:hover:text-gray-300 transition-opacity duration-500">
                    Privacy
                </Link>
                <Link href="/blog" className="hover:opacity-80 outline-none focus:outline-none focus:ring-0 dark:hover:text-gray-300 transition-opacity duration-500">
                    Blog
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar2;
