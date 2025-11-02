import React, { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Sidebar from './Sidebar';

interface Filter {
  id: number;
  name: string;
  slug: string;
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
}

interface LayoutProps2 extends PageProps {
  libraries: Library[];
  userLibraryIds?: number[];
  children: React.ReactNode;
  currentRoute: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const Layout2: React.FC<LayoutProps2> = ({
  children,
  currentRoute,
  onSearch = () => {},
  searchQuery = '',
  filters,
  libraries,
  userLibraryIds = [],
  auth,
}) => {
  const { url, props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto bg-[#F8F8F9] dark:bg-gray-900">
      <Sidebar
        currentRoute={currentRoute}
        auth={authData}
        ziggy={props.ziggy}
      />

      <div className="lg:ml-64">

        <main className="min-h-screen pt-10 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout2;
