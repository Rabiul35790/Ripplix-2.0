import React, { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import SeoHead from '@/Components/SeoHead';
import Sidebar from './Sidebar';
import Header from './Header';

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
  published_date:string;
}

interface LayoutProps extends PageProps {
  libraries: Library[];
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
  children: React.ReactNode;
  currentRoute: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
    userPlanLimits?: UserPlanLimits | null;
    currentPlan?: any;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentRoute,
  onSearch = () => {},
  searchQuery = '',
  filters,
  libraries,
  userPlanLimits,
  currentPlan,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onLibraryViewed,
  auth,
}) => {
  const { url, props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto bg-[#F8F8F9] dark:bg-gray-900">
      <SeoHead />
      <Sidebar
        currentRoute={currentRoute}
        auth={authData}
        ziggy={props.ziggy}
      />

      <div className="lg:ml-64">
        <Header
          libraries={libraries}
          onSearch={onSearch}
          searchQuery={searchQuery}
          auth={authData}
          filters={filters}
          ziggy={props.ziggy}
          userLibraryIds={userLibraryIds}
          userPlanLimits={userPlanLimits}
          currentPlan={currentPlan}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={onLibraryViewed}
        />

        <main className="min-h-screen pt-10 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
