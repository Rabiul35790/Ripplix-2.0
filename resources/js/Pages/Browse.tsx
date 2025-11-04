import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryGrid from './LibraryGrid';
import LibraryModal from './LibraryModal';
import Layout from './Layout';
import FilterSection from './Website/Components/FilterSection';
import CategoryHeader from './CategoryHeader';
import { ArrowBigLeft, ArrowBigRight, ChevronRight, Home, Infinity } from 'lucide-react';

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

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface BrowseProps extends PageProps {
  libraries: Library[];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  isAuthenticated: boolean;
  totalLibraryCount: number;
  userPlanLimits?: UserPlanLimits | null;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  filterType?: 'category' | 'industry' | 'interaction';
  filterValue?: string;
  filterName?: string;
  categoryData?: any;
}

const Browse: React.FC<BrowseProps> = ({
  libraries: initialLibraries = [],
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  isAuthenticated: initialIsAuthenticated = false,
  totalLibraryCount,
  filters,
  filterType,
  filterValue,
  filterName,
  categoryData,
  userPlanLimits,
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isAuthenticated = initialIsAuthenticated || !!authData?.user;

  const [searchQuery, setSearchQuery] = useState('');
  const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);
  const [itemsToShow, setItemsToShow] = useState(isAuthenticated ? 12 : 3);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(3);

  // State for libraries data
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries);
  const [allLibraries, setAllLibraries] = useState<Library[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(initialLibraries.length === 0);

  // State for userLibraryIds
  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);

  // State for viewedLibraryIds with real-time updates
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  const [pagination, setPagination] = useState({
  current_page: 1,
  last_page: 1,
  total: 0,
  has_more: false
});

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
      // Avoid duplicates
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  // Fetch libraries after component mounts (NEW - for instant navigation)
  useEffect(() => {
  const fetchLibraries = async () => {
    if (libraries.length > 0) {
      setIsLoadingLibraries(false);
      return;
    }

    try {
      setIsLoadingLibraries(true);

      const params = new URLSearchParams();

      if (filterValue) {
        if (filterType === 'category') params.set('category', filterValue);
        if (filterType === 'industry') params.set('industry', filterValue);
        if (filterType === 'interaction') params.set('interaction', filterValue);
      }

      if (selectedPlatform !== 'all') {
        params.set('platform', selectedPlatform);
      }

      params.set('page', '1'); // Start with page 1

      const response = await fetch(`/api/browse/libraries?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch libraries');
      }

      const data = await response.json();

      setLibraries(data.libraries);
      setAllLibraries(data.allLibraries);
      setPagination(data.pagination); // Store pagination info
    } catch (error) {
      console.error('Error fetching libraries:', error);
    } finally {
      setIsLoadingLibraries(false);
    }
  };

  fetchLibraries();
}, [filterType, filterValue]);
  // Re-fetch when platform filter changes
  useEffect(() => {
    if (libraries.length === 0) return; // Initial load is handled above

    const fetchFilteredLibraries = async () => {
      try {
        setIsLoadingLibraries(true);

        const params = new URLSearchParams();

        if (filterValue) {
          if (filterType === 'category') params.set('category', filterValue);
          if (filterType === 'industry') params.set('industry', filterValue);
          if (filterType === 'interaction') params.set('interaction', filterValue);
        }

        if (selectedPlatform !== 'all') {
          params.set('platform', selectedPlatform);
        }

        const response = await fetch(`/api/browse/libraries?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch libraries');
        }

        const data = await response.json();

        setLibraries(data.libraries);
        setAllLibraries(data.allLibraries);
      } catch (error) {
        console.error('Error fetching libraries:', error);
      } finally {
        setIsLoadingLibraries(false);
      }
    };

    fetchFilteredLibraries();
  }, [selectedPlatform]);

  // Check URL for library modal - now checks path instead of query parameter
  useEffect(() => {
    // Check if URL matches /library/{slug} pattern
    const pathMatch = window.location.pathname.match(/^\/library\/([^/]+)$/);

    if (pathMatch) {
      const librarySlug = pathMatch[1];
      if (!modalLibrary || modalLibrary.slug !== librarySlug) {
        fetchLibraryForModal(librarySlug);
      }
    } else if (isModalOpen && !window.location.pathname.startsWith('/library/')) {
      // Close modal if we're not on a library URL
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
      // Redirect to browse page if library not found
      const currentPath = window.location.pathname;
      const basePath = currentPath.includes('/browse') ? window.location.pathname.split('?')[0] : '/browse';
      window.history.replaceState({}, '', basePath + window.location.search);
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  // Get current category data for CategoryHeader
  const currentCategory = useMemo(() => {
    if (filterType === 'category' && filterValue) {
      return filters.categories.find(cat => cat.slug === filterValue);
    }
    return null;
  }, [filterType, filterValue, filters.categories]);

  // Filter libraries based on search and active page filter
  const filteredLibraries = useMemo(() => {
    let filtered = libraries;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(library =>
        library.title.toLowerCase().includes(query) ||
        library.description?.toLowerCase().includes(query) ||
        library.platforms.some(platform => platform.name.toLowerCase().includes(query)) ||
        library.categories.some(category => category.name.toLowerCase().includes(query)) ||
        library.industries.some(industry => industry.name.toLowerCase().includes(query)) ||
        library.interactions.some(interaction => interaction.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [libraries, searchQuery]);

  // Apply FilterSection's platform filter separately on top of existing filters
  const finalFilteredLibraries = useMemo(() => {
    // Platform filtering is now handled by the API, so just return filtered libraries
    return filteredLibraries;
  }, [filteredLibraries]);

  // Update displayed libraries when finalFilteredLibraries or itemsToShow changes
  useEffect(() => {
    if (isAuthenticated) {
      // For authenticated users, show normal pagination
      setDisplayedLibraries(finalFilteredLibraries.slice(0, itemsToShow));
    } else {
      // For unauthenticated users, limit to 18 results maximum
      setDisplayedLibraries(finalFilteredLibraries.slice(0, 18));
    }
  }, [finalFilteredLibraries, itemsToShow, isAuthenticated]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setItemsToShow(isAuthenticated ? 12 : 10);
  };

  const handleLoadMore = () => {
    if (isAuthenticated) {
      setItemsToShow(prev => prev + 12);
    }
  };

  // Handle library click - URL update is handled by LibraryCard
  const handleLibraryClick = (library: Library) => {
    setModalLibrary(library);
    setIsModalOpen(true);
    // URL update is handled by LibraryCard component
  };

  // Handle close modal - URL update is handled by LibraryModal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
    // URL update is handled by LibraryModal component
  };

  // Handle library navigation - URL is handled by LibraryModal
  const handleLibraryNavigation = (library: Library) => {
    setModalLibrary(library);
    // URL update is handled by LibraryModal component
  };

  const handleStarClick = (library: Library, isStarred: boolean) => {
    if (!authData.user) {
      console.log('User not authenticated');
      return;
    }
    console.log(`Library ${library.title} ${isStarred ? 'starred' : 'unstarred'}`);
  };

  // Filter handlers
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setItemsToShow(isAuthenticated ? 12 : 10);
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

  // For authenticated users, check if there are more results in the filtered set
  // For unauthenticated users, never show "Load More"
  const hasMore = isAuthenticated && displayedLibraries.length < finalFilteredLibraries.length;

  // Get page title based on filter
  const getPageTitle = () => {
    if (filterType && filterName) {
      switch (filterType) {
        case 'category':
          return `${filterName} - Browse by Category`;
        case 'industry':
          return `${filterName} - Browse by Industry`;
        case 'interaction':
          return `${filterName} - Browse by Interaction`;
        default:
          return 'Browse Libraries';
      }
    }
    return 'Browse Libraries';
  };

  // Get breadcrumb text
  const getBreadcrumbText = () => {
    if (filterType && filterName) {
      switch (filterType) {
        case 'category':
          return `Apps: ${filterName}`;
        case 'industry':
          return `Category: ${filterName}`;
        case 'interaction':
          return `Element: ${filterName}`;
        default:
          return 'All Libraries';
      }
    }
    return 'All Libraries';
  };

  // Get active filter description for display
  const getActiveFiltersDescription = () => {
    const activeFilters = [];

    if (selectedPlatform !== 'all') {
      let platform = filters.platforms.find(p => p.id.toString() === selectedPlatform);
      if (!platform) {
        platform = filters.platforms.find(p => p.name.toLowerCase() === selectedPlatform.toLowerCase());
      }
      if (platform) {
        activeFilters.push(`Platform: ${platform.name}`);
      } else {
        activeFilters.push(`Platform: ${selectedPlatform}`);
      }
    }

    if (filterName) {
      activeFilters.push(`${filterType === 'category' ? 'Category' : filterType === 'industry' ? 'Industry' : 'Interaction'}: ${filterName}`);
    }

    return activeFilters.length > 0 ? ` (${activeFilters.join(', ')})` : '';
  };

  return (
    <>
      <Head title={getPageTitle()} />
      <Layout
        libraries={libraries}
        currentRoute={url}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        userPlanLimits={userPlanLimits}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
      >

        {/* Header Section - Shows immediately */}
        <div className="bg-[#F8F8F9] dark:bg-gray-900 font-sora">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6 font-sora">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 text-sm text-[#BABABA] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5">
              <Link
                href="/"
                className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors duration-300 ease-in-out"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
              </Link>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
              <span className="text-[#BABABA] dark:text-white text-sm sm:text-lg md:text-base font-medium">
                Interaction From
              </span>
            </nav>

            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-3xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {filterName || 'All Libraries'}
                </h1>
              </div>

              {/* Right side - Showing libraries count */}
              <div className="text-left sm:text-right sm:mr-8 md:mr-6">
                <div className="text-[#BABABA] dark:text-gray-400 text-xs sm:text-xs md:text-[11px]">
                  Showing
                </div>
                <div className="text-[#2E241C] dark:text-gray-400 text-sm sm:text-sm md:text-[13px] mt-1 font-semibold">
                  {!isAuthenticated && totalLibraryCount > 18
                    ? `18 of ${totalLibraryCount} Results`
                    : `${totalLibraryCount} ${totalLibraryCount === 1 ? 'Result' : 'Results'}`
                  }
                  {searchQuery && ` for "${searchQuery}"`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state or content */}
        {isLoadingLibraries ? (
          <>
            {/* Category Header Skeleton - Only show for category filter */}
            {currentCategory && filterType === 'category' && (
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div className="max-w-full px-4 sm:px-6 md:px-7 lg:px-6 mx-auto sticky top-[60px] md:top-[75px] lg:top-[75px] z-10">
              <FilterSection
                filters={filters}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                cardsPerRow={cardsPerRow}
                onCardsPerRowChange={handleCardsPerRowChange}
              />
            </div>

            {/* Skeleton Loader */}
            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16 pt-4 sm:pt-8 md:pt-6">
              <div className={`grid gap-4 sm:gap-6 md:gap-5 ${
                cardsPerRow === 2 ? 'grid-cols-1 md:grid-cols-2' :
                cardsPerRow === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Category Header - Only show for category filter */}
            {currentCategory && filterType === 'category' && categoryData && (
              <CategoryHeader
                category={categoryData}
                auth={authData}
                ziggy={ziggyData}
              />
            )}

            {/* Filter Section */}
            <div className="max-w-full px-4 sm:px-6 md:px-7 lg:px-6 mx-auto sticky top-[60px] md:top-[75px] lg:top-[75px] z-10">
              <FilterSection
                filters={filters}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                cardsPerRow={cardsPerRow}
                onCardsPerRowChange={handleCardsPerRowChange}
              />
            </div>

            {/* Library Grid */}
            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16 pt-4 sm:pt-8 md:pt-6">
              <LibraryGrid
                ziggy={ziggyData}
                libraries={displayedLibraries}
                onLibraryClick={handleLibraryClick}
                onLoadMore={hasMore ? handleLoadMore : undefined}
                hasMore={hasMore}
                isLoading={false}
                cardsPerRow={cardsPerRow}
                auth={authData}
                onStarClick={handleStarClick}
                userLibraryIds={userLibraryIds}
                viewedLibraryIds={viewedLibraryIds}
                onLibraryViewed={handleLibraryViewed}
                userPlanLimits={userPlanLimits}
              />
            </div>

            {/* Empty State */}
            {finalFilteredLibraries.length === 0 && !isLoadingLibraries && (
              <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16">
                <div className="text-center py-8 sm:py-12 md:py-10 font-sora px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-5">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-[22px] font-sora !font-bold text-[#2B235A] dark:text-white mb-2">
                    No libraries found
                  </h3>
                  <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 max-w-md mx-auto mb-4 sm:mb-6 md:mb-5">
                    {searchQuery || selectedPlatform !== 'all'
                      ? `No libraries match your current filters${filterName ? ` in ${filterName}` : ''}.`
                      : `No libraries found${filterName ? ` for ${filterName}` : ''}.`
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPlatform('all');
                      setItemsToShow(isAuthenticated ? 12 : 3);
                    }}
                    className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                  >
                    <span className='z-10'>Clear All Filters</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Library Modal */}
        <LibraryModal
          library={modalLibrary}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onClick={handleLibraryClick}
          allLibraries={allLibraries}
          onNavigate={handleLibraryNavigation}
          onStarClick={handleStarClick}
          auth={authData}
          ziggy={ziggyData}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
          filters={filters}
          filterType={filterType}
          filterValue={filterValue}
          filterName={filterName}
          userPlanLimits={userPlanLimits}
        />
      </Layout>
    </>
  );
};

export default Browse;
