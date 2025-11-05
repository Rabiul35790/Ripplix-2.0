import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Menu, X, BookOpen, Users, Target, Smartphone, Zap, FolderOpen, User, Phone, Heart, Command, Star } from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  auth: PageProps['auth'];
  ziggy?: PageProps['ziggy'];
}

interface Settings {
  logo: string;
  copyright_text: string;
}

interface ExtendedPageProps extends PageProps {
  settings?: Settings;
}

interface Ad {
  id: number;
  title: string;
  image_url: string;
  target_url: string;
}

// Define interface for menu items
interface MenuItem {
  name: string;
  route: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  authRequired?: boolean; // Make this optional
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, auth, ziggy }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarAd, setSidebarAd] = useState<Ad | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  const { url, props } = usePage<ExtendedPageProps>();

  // Get logo from settings
  const logo = props?.settings?.logo || null;
  const copyright_text = props?.settings?.copyright_text || null;

  // Get dark mode from localStorage (same as dashboard)
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch sidebar ad
  useEffect(() => {
    const fetchSidebarAd = async () => {
      try {
        setIsLoadingAd(true);
        const response = await fetch(`/ads/sidebar?t=${Date.now()}`);
        const result = await response.json();

        // Check if result is successful AND data exists AND is not null
        if (result.success && result.data && result.data !== null) {
          setSidebarAd(result.data);
        } else {
          // No active ads available
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

  // Track ad click
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
      icon: Command,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'Collections',
      route: 'collections',
      icon: BookOpen,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Following',
      route: 'following',
      icon: Star,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    //   authRequired: true // Uncommented and properly typed
    },
    // {
    //   name: 'Challenges',
    //   route: 'challenges',
    //   icon: Target,
    //   iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    //   iconColor: 'text-cyan-600 dark:text-cyan-400'
    // },
  ];

  const quickLinks: MenuItem[] = [
    {
      name: 'All Apps',
      route: 'all-apps',
      icon: Smartphone,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      name: 'All Elements',
      route: 'all-elements',
      icon: Zap,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'All Categories',
      route: 'all-categories',
      icon: FolderOpen,
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

  // Filter menu items based on authentication status
  const filteredMenuItems = menuItems.filter(item => {
    if (item.authRequired && !auth.user) {
      return false;
    }
    return true;
  });

  const isActive = (route: string) => {
    // Handle root/explore route - both point to the same content
    if (route === '' || route === '/' || route === 'explore') {
      return url === '/' ||
             currentRoute === '/' ||
             currentRoute === '' ||
             currentRoute === 'explore' ||
             url === '/explore';
    }

    // Check if current route matches (with or without leading slash)
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
    // For explore route, return root '/' since that's where explore content is served
    if (route === 'explore') {
      return '/';
    }
    // For root/empty route, return '/'
    if (route === '' || route === '/') {
      return '/';
    }
    return `/${route}`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Main Content */}
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
                  // Fallback to default logo if image fails to load
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
        <nav className="space-y-1">
            {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.route);

            return (
                <Link
                key={item.name}
                href={getRouteHref(item.route)}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-3 py-2 rounded-lg group focus:outline-none transition-all duration-500 ease-in-out ${
                    active
                    ? 'bg-[linear-gradient(90deg,_#F8F8F9_33.59%,_rgba(255,255,255,0)_114.25%)] dark:bg-orange-900/20 text-[#443B82] dark:text-white'
                    : 'text-[#443B82] dark:text-gray-300 bg-transparent'
                }`}
                >
                {/* Apply bold only to active text */}
                <span
                    className={`font-medium text-sm transition-all duration-500 ease-in-out ${
                    active ? '!font-bold' : ''
                    }`}
                >
                    {item.name}
                </span>
                <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${item.iconBg} flex-shrink-0 transition-all duration-500 ease-in-out`}
                >
                    <IconComponent className={`w-3.5 h-3.5 ${item.iconColor} transition-all duration-500 ease-in-out`} />
                </div>
                </Link>
            );
            })}
        </nav>
        </div>


        {/* Quick Links */}
        <div className="px-5 mb-4 font-sora">
          <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
            Quick Links
          </div>
          <nav className="space-y-1">
            {quickLinks.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.route);

              return (
                <Link
                  key={item.name}
                  href={getRouteHref(item.route)}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg group focus:outline-none transition-all duration-500 ease-in-out ${
                    active
                      ? 'bg-[linear-gradient(90deg,_#F8F8F9_33.59%,_rgba(255,255,255,0)_114.25%)] dark:bg-orange-900/20 text-[#443B82] !font-bold dark:text-white'
                      : 'text-[#443B82] dark:text-gray-300 bg-transparent'
                  }`}
                >
                  <span
                    className={`font-medium text-sm transition-all duration-500 ease-in-out ${
                    active ? '!font-bold' : ''
                    }`}
                >
                    {item.name}
                </span>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.iconBg} flex-shrink-0 transition-all duration-500 ease-in-out`}>
                    <IconComponent className={`w-3.5 h-3.5 ${item.iconColor} transition-all duration-500 ease-in-out`} />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* About */}
        <div className="px-5 mb-4 font-sora">
          <div className="text-xs text-[#BCBDC8] dark:text-gray-400 uppercase !font-medium mb-2 tracking-wide">
            About
          </div>
          <nav className="space-y-1">
            {aboutLinks.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.route);

              return (
                <Link
                  key={item.name}
                  href={getRouteHref(item.route)}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg group focus:outline-none transition-all duration-500 ease-in-out ${
                    active
                      ? 'bg-[linear-gradient(90deg,_#F8F8F9_33.59%,_rgba(255,255,255,0)_114.25%)] dark:bg-orange-900/20 text-[#443B82] !font-bold dark:text-white'
                      : 'text-[#443B82] dark:text-gray-300 bg-transparent'
                  }`}
                >
                  <span
                    className={`font-medium text-sm transition-all duration-500 ease-in-out ${
                    active ? '!font-bold' : ''
                    }`}
                >
                    {item.name}
                </span>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.iconBg} flex-shrink-0 transition-all duration-500 ease-in-out`}>
                    <IconComponent className={`w-3.5 h-3.5 ${item.iconColor} transition-all duration-500 ease-in-out`} />
                  </div>
                </Link>
              );
            })}
          </nav>
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
              className="max-h-[193px] max-w-[192px] block hover:opacity-90 transition-opacity focus:outline-none outline-none rounded-lg"
            //   title={`Click to visit: ${sidebarAd.title}`}
            >
              <img
                src={sidebarAd.image_url}
                alt={sidebarAd.title}
                className="rounded-lg max-h-[193px] max-w-[192px] object-cover w-full h-full"
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </button>
          ) : (
            // Show contact message when no ads are available
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

      {/* Footer Space for Copyright and Terms/Privacy Links */}
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-off-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 focus:outline-none"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
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
