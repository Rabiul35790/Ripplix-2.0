import React, { useEffect, useCallback, useState} from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps as BasePageProps } from '@/types';
import Layout from './Layout';
import {
  Home,
  ChevronRight,
  User,
  Users,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import LayoutUnauth from './LayoutUnauth';

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


interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface Settings {
  emails: string[];
  phones: string[];
  addresses: string[];
  copyright_text?: string;
  logo?: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Curator {
  id: number;
  title?: string;
  content: string;
  image?: string;
  image_url?: string;
  image_name?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CuratorsProps extends BasePageProps {
  libraries: Library[];
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  userPlanLimits?: UserPlanLimits | null;
  currentPlan?: any;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  filterType?: string | null;
  filterValue?: string | null;
  filterName?: string | null;
  categoryData?: any | null;
  settings: Settings;
  curators: Curator[];
}

interface PageProps {
  flash?: any;
  auth: any;
  ziggy: any;
  [key: string]: any;
}

const Curators: React.FC<CuratorsProps> = ({
  libraries = [],
  filters,
   userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  userPlanLimits,
  currentPlan,
  filterType,
  filterValue,
  filterName,
  categoryData,
  settings,
  curators = [],
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // Use settings from props first, then fallback to page props
  const settingsData = settings || props.settings;

  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);

  // ADD THIS: State for viewedLibraryIds
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // ADD THIS: Update viewedLibraryIds when props change
  useEffect(() => {
    setViewedLibraryIds(initialViewedLibraryIds);
  }, [initialViewedLibraryIds]);

  // ADD THIS: Update userLibraryIds when props change
  useEffect(() => {
    setUserLibraryIds(initialUserLibraryIds);
  }, [initialUserLibraryIds]);

  // ADD THIS: Callback to handle when a library is viewed
  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  // Function to strip HTML tags and get plain text
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head title="About" />
      <LayoutUnauth
        libraries={libraries}
        currentRoute={url}
        onSearch={() => {}}
        searchQuery=""
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        settings={settingsData}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
      >
        <div className="min-h-screen bg-[#F8F8F9] dark:bg-gray-900 py-8 md:py-12 font-sora">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-sm text-[#BABABA] dark:text-gray-400 mb-4">
              <Link
                href="/"
                className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors"
              >
                <Home className='w-5 h-5'/>
              </Link>
              <ChevronRight className="w-4 h-4" />
            </nav>

            {/* Page Title */}
            <h1 className="text-xl md:text-2xl lg:text-[26px] font-sora !font-semibold text-gray-900 focus:outline-none outline-none dark:text-white mb-6 md:mb-8 lg:mb-10">
              About Us
            </h1>

            {/* Curators Content */}
            {curators.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No Curators Yet
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                  Our curator profiles are coming soon. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-16 md:space-y-24 lg:space-y-32 max-w-7xl mx-auto">
                {curators.map((curator, index) => (
                  <div
                    key={curator.id}
                    className={`grid grid-cols-1 gap-8 md:gap-10 lg:gap-12 items-center ${
                      index % 2 === 0
                        ? 'lg:grid-cols-[70%_30%]' // Odd rows: text 70%, image 30%
                        : 'lg:grid-cols-[30%_70%]' // Even rows: image 30%, text 70%
                    }`}
                  >
                    {/* Text Section (70% width on large screens, full width on mobile/md) */}
                    <div className={`space-y-4 md:space-y-5 lg:space-y-6 ${
                      index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
                    }`}>
                      {curator.title && (
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2B235A] dark:text-white">
                          {curator.title}
                        </h2>
                      )}

                      <div
                        className="text-base md:text-lg leading-relaxed text-[#474750] dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: curator.content }}
                      />
                    </div>

                    {/* Image Section (30% width on large screens, full width on mobile/md) */}
                    <div className={`flex justify-center ${
                      index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'
                    }`}>
                      {curator.image_url || curator.image ? (
                        <div className="relative bg-white dark:bg-gray-800 p-3 md:p-4 rounded-md shadow-md transform rotate-2 md:rotate-3 hover:rotate-1 md:hover:rotate-2 transition duration-300 ease-in-out w-full max-w-[280px] md:max-w-[320px] lg:w-[360px]">
                          <img
                            src={curator.image_url || curator.image}
                            alt={curator.title || `Curator ${index + 1}`}
                            className="rounded-md w-full h-[300px] md:h-[360px] lg:h-[400px] object-cover"
                            loading="lazy"
                          />
                          {curator.image_name && (
                            <p className="mt-3 md:mt-4 text-center font-kalam !font-extrabold text-gray-800 dark:text-gray-200 text-2xl md:text-3xl">
                              {curator.image_name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="relative bg-[#FAF9F6] dark:bg-gray-800 p-8 md:p-10 lg:p-12 rounded-lg shadow-md flex flex-col items-center justify-center w-full max-w-[280px] md:max-w-[300px] lg:w-[320px] h-[340px] md:h-[400px] lg:h-[440px]">
                          <ImageIcon className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-400" />
                          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">
                            No Image Available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </LayoutUnauth>
    </>
  );
};

export default Curators;
