import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Sidebar2 from './Sidebar2';
import Header2 from './Header2';
import HeroSection from '../Components/HeroSection';

interface Filter {
  id: number;
  name: string;
  slug: string;
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
  published_date: string;
}

interface Settings {
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
  hero_image?: string;
  copyright_text?: string;
}

interface LayoutUnauthProps extends PageProps {
  libraries: Library[];
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
  children: React.ReactNode;
  currentRoute: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  userPlanLimits?: UserPlanLimits | null;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  settings?: Settings;
  showHero?: boolean;
}

const LayoutUnauth: React.FC<LayoutUnauthProps> = ({
  children,
  currentRoute,
  onSearch = () => {},
  searchQuery = '',
  filters,
  libraries,
  userPlanLimits,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onLibraryViewed,
  auth,
  settings,
  showHero = true,
}) => {
  const { props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.getElementById('main-header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const header = document.getElementById('main-header');
          const sidebar = document.getElementById('main-sidebar');
          const sidebarContainer = document.getElementById('sidebar-container');
          const contentWrapper = document.getElementById('content-wrapper');

          if (!header || !sidebar || !sidebarContainer || !contentWrapper) {
            ticking = false;
            return;
          }

          const headerHeight = header.offsetHeight;
          const scrollY = window.scrollY;

          // Get the wrapper's padding to calculate correct left position
          const wrapperRect = contentWrapper.getBoundingClientRect();
          const wrapperLeft = wrapperRect.left;

          // Get the initial position of the sidebar container
          const containerRect = sidebarContainer.getBoundingClientRect();
          const containerTop = containerRect.top + scrollY;
          const containerWidth = containerRect.width;

          // Calculate when sidebar should become sticky
          const shouldStick = scrollY >= (containerTop - headerHeight);

          if (shouldStick) {
            // Make sidebar sticky with dynamic positioning
            sidebar.style.position = 'fixed';
            sidebar.style.top = `${headerHeight}px`;
            sidebar.style.left = `${wrapperLeft}px`;
            sidebar.style.width = `${containerWidth}px`;
            sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
            sidebar.style.zIndex = '40';

            // Add placeholder to maintain layout
            sidebarContainer.style.width = `${containerWidth}px`;
          } else {
            // Reset to normal position
            sidebar.style.position = 'relative';
            sidebar.style.top = '0';
            sidebar.style.left = '0';
            sidebar.style.width = '100%';
            sidebar.style.height = 'auto';
            sidebar.style.zIndex = 'auto';

            // Remove placeholder
            sidebarContainer.style.width = '';
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto bg-[#F8F8F9] dark:bg-gray-900">

      {/* Full Width Header - Sticky */}
      <div id="main-header" className="sticky top-0 z-50 bg-white dark:bg-gray-900 w-full">
        <Header2
          libraries={libraries}
          onSearch={onSearch}
          searchQuery={searchQuery}
          auth={authData}
          filters={filters}
          ziggy={props.ziggy}
          userLibraryIds={userLibraryIds}
          userPlanLimits={userPlanLimits}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={onLibraryViewed}
          settings={settings}
        />
      </div>

      {/* Hero Section - Full Width */}
      {showHero && <HeroSection settings={settings} />}

      {/* Content Area with Sidebar */}
      <div id="content-wrapper" className="w-full mt-12 lg:mt-16">
        <div className="flex w-full">
          {/* Sidebar - Hidden on mobile, visible on lg screens */}
          <div id="sidebar-container" className="hidden lg:block w-64 flex-shrink-0">
            {/* Actual Sidebar */}
            <div id="main-sidebar" className="w-full">
              <Sidebar2
                currentRoute={currentRoute}
                auth={authData}
                ziggy={props.ziggy}
              />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-h-screen px-4 sm:px-6 lg:px-8 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LayoutUnauth;
