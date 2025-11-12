import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Menu, X, BookOpen, Users, Target, Smartphone, Zap, FolderOpen, User, Phone, Heart, Command, Star, Layers, Navigation, SquareMousePointer, Building2 } from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  auth: PageProps['auth'];
  ziggy?: PageProps['ziggy'];
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

interface Settings {
  logo: string;
  copyright_text: string;
}

interface ExtendedPageProps extends PageProps {
  settings?: Settings;
}

interface MenuItem {
  name: string;
  route: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  authRequired?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, auth, ziggy }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarAd, setSidebarAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  const { url, props } = usePage<ExtendedPageProps>();

  // Sliding indicator state
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<React.CSSProperties>({});
  const workspaceNavRef = useRef<HTMLDivElement>(null);
  const quickLinksNavRef = useRef<HTMLDivElement>(null);
  const aboutLinksNavRef = useRef<HTMLDivElement>(null);

  const logo = props?.settings?.logo || null;
  const copyright_text = props?.settings?.copyright_text || null;

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
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
  }, []);

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
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'Collections',
      route: 'collections',
      icon: FolderOpen,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Following',
      route: 'following',
      icon: Star,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const quickLinks: MenuItem[] = [
    {
      name: 'All Apps',
      route: 'all-apps',
      icon: Command,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'All Elements',
      route: 'all-elements',
      icon: SquareMousePointer,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'All Industries',
      route: 'all-categories',
      icon: Building2,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
  ];

  const aboutLinks: MenuItem[] = [
    {
      name: 'Curators',
      route: 'curators',
      icon: User,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'Contact Us',
      route: 'contact-us',
      icon: Phone,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Sponsor Us',
      route: 'sponsor-us',
      icon: Heart,
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400'
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
              onClick={closeMobileMenu}
              data-active={active}
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* Logo */}
        <div className="p-8">
          <Link href="/" className="flex items-center space-x-2 focus:outline-none" onClick={closeMobileMenu}>
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

        {/* Workspace */}
        <div className="px-5 mb-4 mt-2 font-sora">
          <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
            Workspace
          </div>
          {renderNavSection(filteredMenuItems, workspaceNavRef, 'workspace')}
        </div>

        {/* Quick Links */}
        <div className="px-5 mb-4 font-sora">
          <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
            Quick Links
          </div>
          {renderNavSection(quickLinks, quickLinksNavRef, 'quicklinks')}
        </div>

        {/* About */}
        <div className="px-5 mb-4 font-sora">
          <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
            About
          </div>
          {renderNavSection(aboutLinks, aboutLinksNavRef, 'about')}
        </div>

        {/* Dynamic Advertisement Section */}
        <div className="px-5 mt-10 font-sora">
          {isLoadingAd ? (
            <div className="max-h-[193px] max-w-[192px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
              <div className="h-[193px] w-[192px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ) : sidebarAd ? (
            <button
              onClick={() => handleAdClick(sidebarAd)}
              className="relative max-h-[193px] max-w-[192px] block hover:opacity-90 transition-opacity focus:outline-none outline-none rounded-lg overflow-hidden"
            >
              <span className="absolute top-2 left-2 bg-[#2B235A]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md dark:bg-orange-500/80">
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
            <div className="max-h-[193px] max-w-[192px] dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-[#CECCFF] dark:border-orange-800">
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
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 pt-4 font-sora">
        <div className="text-xs text-[#443B82] dark:text-gray-400 space-y-1.5">
          <div className="text-center">
            {copyright_text ? (
              <p>{copyright_text}</p>
            ) : null}
          </div>
          <div className="flex justify-center space-x-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 p-2 bg-off-white z-[70] dark:bg-gray-800 rounded-lg dark:border-gray-700 focus:outline-none"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300 left-52 top-9 fixed" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-off-white dark:bg-gray-900 h-screen fixed top-0 overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 w-64 h-screen bg-off-white dark:bg-gray-900 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
