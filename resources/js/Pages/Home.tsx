import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Layout from './Layout';
import LibraryModal from './LibraryModal';
import HeroSection from '../Components/HeroSection';
import FilterWrapper from '../Components/FilterWrapper';
import LibraryGrid from './LibraryGrid';
import BoardCard from '../Components/BoardCard';
import TopLibrariesSection from '../Components/TopLibrariesSection';
import LayoutUnauth from './LayoutUnauth';

interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  is_top?: boolean;
}

interface Settings {
    logo?: string;
    favicon?: string;
    authentication_page_image?: string;
    copyright_text?: string;
    hero_image?: string;
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
  categories: Category[];
  industries: Array<{ id: number; name: string; is_top: boolean }>;
  interactions: Array<{ id: number; name: string; is_top: boolean }>;
  created_at: string;
  published_date: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

interface TopLibraryGroup {
  name: string;
  slug: string;
  total_count: number;
  libraries: Library[];
  image?: string;
}

interface HomeProps extends PageProps {
  libraries: Library[];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  pagination: Pagination;
  userPlanLimits?: UserPlanLimits | null;
  currentPlatformFilter?: string;
  settings?: Settings;
  topLibrariesByCategory?: TopLibraryGroup[];
  topLibrariesByInteraction?: TopLibraryGroup[];
  topLibrariesByIndustry?: TopLibraryGroup[];
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  canLogin?: boolean;
  canRegister?: boolean;
  laravelVersion?: string;
  phpVersion?: string;
  isAuthenticated: boolean;
}

const Home: React.FC<HomeProps> = ({
  libraries: initialLibraries,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  pagination: initialPagination,
  currentPlatformFilter = 'all',
  userPlanLimits,
  filters,
  settings,
  topLibrariesByCategory: initialTopCategory = [],
  topLibrariesByInteraction: initialTopInteraction = [],
  topLibrariesByIndustry: initialTopIndustry = [],
  auth,
  isAuthenticated
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // State management with proper fallback for pagination
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries || []);
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination || {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: initialLibraries?.length || 0,
      has_more: false
    }
  );

  // Top libraries state
  const [topLibrariesByCategory, setTopLibrariesByCategory] = useState<TopLibraryGroup[]>(initialTopCategory);
  const [topLibrariesByInteraction, setTopLibrariesByInteraction] = useState<TopLibraryGroup[]>(initialTopInteraction);
  const [topLibrariesByIndustry, setTopLibrariesByIndustry] = useState<TopLibraryGroup[]>(initialTopIndustry);
  const [isLoadingTopLibraries, setIsLoadingTopLibraries] = useState(initialTopCategory.length === 0 && !isAuthenticated);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(currentPlatformFilter);
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  // Ref to prevent multiple simultaneous requests
  const loadingRef = useRef(false);

  // Update viewedLibraryIds when props change
  useEffect(() => {
    setViewedLibraryIds(initialViewedLibraryIds);
  }, [initialViewedLibraryIds]);

  // Update userLibraryIds when props change
  useEffect(() => {
    setUserLibraryIds(initialUserLibraryIds);
  }, [initialUserLibraryIds]);

  // Callback to handle when a library is viewed
  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  // NEW: Fetch top libraries after page loads (only for unauthenticated users)
  useEffect(() => {
    const fetchTopLibraries = async () => {
      // Only fetch if unauthenticated and don't have data yet
      if (isAuthenticated || topLibrariesByCategory.length > 0) {
        setIsLoadingTopLibraries(false);
        return;
      }

      try {
        setIsLoadingTopLibraries(true);

        const response = await fetch('/api/home/top-libraries');

        if (!response.ok) {
          throw new Error('Failed to fetch top libraries');
        }

        const data = await response.json();

        setTopLibrariesByCategory(data.topLibrariesByCategory || []);
        setTopLibrariesByInteraction(data.topLibrariesByInteraction || []);
        setTopLibrariesByIndustry(data.topLibrariesByIndustry || []);
      } catch (error) {
        console.error('Error fetching top libraries:', error);
      } finally {
        setIsLoadingTopLibraries(false);
      }
    };

    // Delay fetching top libraries slightly to prioritize main content
    const timer = setTimeout(fetchTopLibraries, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Check URL for library modal
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/library\/([^/]+)$/);

    if (pathMatch) {
      const librarySlug = pathMatch[1];
      if (!modalLibrary || modalLibrary.slug !== librarySlug) {
        fetchLibraryForModal(librarySlug);
      }
    } else if (isModalOpen && window.location.pathname === '/') {
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  }, [window.location.pathname]);

  // Function to fetch library data for modal
  const fetchLibraryForModal = async (slug: string) => {
    try {
      const response = await fetch(`/api/libraries/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();
      setModalLibrary(data.library);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching library for modal:', error);
      window.history.replaceState({}, '', '/');
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  // Handle platform filter change - reset libraries and fetch new data
  const handlePlatformChange = useCallback(async (platform: string) => {
    setSelectedPlatform(platform);
    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetch(`/?platform=${platform}&page=1`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load libraries: ${response.status}`);
      }

      const data = await response.json();

      setLibraries(data.libraries);
      setPagination(data.pagination);

      if (data.viewedLibraryIds) {
        setViewedLibraryIds(data.viewedLibraryIds);
      }

    } catch (error) {
      console.error('Failed to load libraries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load libraries');
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  // Filter libraries based on search only (platform filter is handled by backend)
  const filteredLibraries = useMemo(() => {
    let filtered = [...libraries];

    if (searchQuery) {
      filtered = filtered.filter(library =>
        library.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        library.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        library.platforms.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [libraries, searchQuery]);

  // Load more libraries function with filter awareness and null checks
  const loadMoreLibraries = useCallback(async () => {
    if (loadingRef.current || isLoadingMore || !pagination?.has_more) {
      return;
    }

    loadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = pagination.current_page + 1;
      const response = await fetch(`/api/home/load-more?page=${nextPage}&platform=${selectedPlatform}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load more libraries: ${response.status}`);
      }

      const data = await response.json();

      if (data.libraries && data.libraries.length > 0) {
        setLibraries(prev => [...prev, ...data.libraries]);
        setPagination(data.pagination);

        if (data.viewedLibraryIds) {
          setViewedLibraryIds(data.viewedLibraryIds);
        }
      } else {
        setPagination(prev => ({ ...prev, has_more: false }));
      }

    } catch (error) {
      console.error('Failed to load more libraries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more libraries');
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [pagination, isLoadingMore, selectedPlatform]);

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCardsPerRowChange = useCallback((count: number) => {
    setCardsPerRow(count);
  }, []);

  const handleLibraryCardClick = useCallback((library: Library) => {
    setModalLibrary(library);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalLibrary(null);
  }, []);

  const handleModalNavigation = useCallback((library: Library) => {
    setModalLibrary(library);
  }, []);

  const handleStarClick = useCallback((library: Library, isStarred: boolean) => {
    if (!authData?.user) {
      console.log('User not authenticated');
      return;
    }
  }, [authData]);

  // Modal libraries for authenticated/unauthenticated users
  const modalLibraries = useMemo(() => {
    return isAuthenticated ? filteredLibraries : filteredLibraries.slice(0, 12);
  }, [isAuthenticated, filteredLibraries]);

  const LayoutComponent = isAuthenticated ? Layout : LayoutUnauth;

  return (
    <>
      <Head title="Inspiring for better Interaction" />
      <LayoutComponent
        currentRoute={url}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters}
        libraries={initialLibraries}
        auth={authData}
        ziggy={ziggyData}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
        userPlanLimits={userPlanLimits}
        settings={settings}
      >

        {!isAuthenticated && (
        <>
            {/* <HeroSection settings={settings} /> */}

            {/* Top Libraries Sections - Show skeleton while loading */}
            {isLoadingTopLibraries ? (
              <div className="mx-4 sm:mx-6 lg:mx-8 py-8">
                <div className="animate-pulse space-y-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <TopLibrariesSection
                topLibrariesByCategory={topLibrariesByCategory}
                topLibrariesByInteraction={topLibrariesByInteraction}
                topLibrariesByIndustry={topLibrariesByIndustry}
              />
            )}
        </>
        )}

        {/* Sticky Filter */}
        <div className="sticky top-[60px] md:top-[75px] lg:top-[75px] z-10">
          <FilterWrapper
            filters={filters}
            selectedPlatform={selectedPlatform}
            onPlatformChange={handlePlatformChange}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={handleCardsPerRowChange}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading libraries
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handlePlatformChange(selectedPlatform)}
                      className="bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-4 sm:mx-6 lg:mx-8 mt-2 sm:mt-4 lg:mt-4 pb-8 sm:pb-10 lg:pb-12">
          <LibraryGrid
            libraries={filteredLibraries}
            onLibraryClick={handleLibraryCardClick}
            onLoadMore={isAuthenticated ? loadMoreLibraries : undefined}
            hasMore={isAuthenticated ? (pagination?.has_more || false) : false}
            isLoadingMore={isLoadingMore}
            cardsPerRow={cardsPerRow}
            auth={authData}
            ziggy={ziggyData}
            onStarClick={handleStarClick}
            userPlanLimits={userPlanLimits}
            userLibraryIds={userLibraryIds}
            viewedLibraryIds={viewedLibraryIds}
            onLibraryViewed={handleLibraryViewed}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <LibraryModal
          library={modalLibrary}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onClick={handleLibraryCardClick}
          allLibraries={modalLibraries}
          onNavigate={handleModalNavigation}
          auth={authData}
          onStarClick={handleStarClick}
          ziggy={ziggyData}
          userPlanLimits={userPlanLimits}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
          filters={filters}
        />
      </LayoutComponent>
    </>
  );
};

export default Home;
