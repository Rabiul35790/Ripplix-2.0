import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryGrid from './LibraryGrid';
import LibraryModal from './LibraryModal';
import Layout from './Layout';
import FilterSection from './Website/Components/FilterSection';
import CategoryHeader from './CategoryHeader';
import { ArrowBigLeft, ArrowBigRight, ChevronRight, Home, Infinity } from 'lucide-react';
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

interface Settings {
    logo?: string;
    favicon?: string;
    authentication_page_image?: string;
    copyright_text?: string;
    hero_image?: string;
}

interface BrowseProps extends PageProps {
  libraries: Library[];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  isAuthenticated: boolean;
  totalLibraryCount: number;
  userPlanLimits?: UserPlanLimits | null;
  currentPlan?: any;
  settings?: Settings;
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
  settings,
  categoryData,
  userPlanLimits,
  currentPlan,
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isAuthenticated = initialIsAuthenticated || !!authData?.user;

  const [searchQuery, setSearchQuery] = useState('');
  const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(2);

  // State for libraries data
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries);
  const [allLibraries, setAllLibraries] = useState<Library[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(initialLibraries.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // State for userLibraryIds
  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);

  // State for viewedLibraryIds with real-time updates
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  const [isFetchingMoreForSuggestions, setIsFetchingMoreForSuggestions] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: isAuthenticated ? 50 : 18,
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
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  // UPDATED: Fetch library for modal with full data
  const fetchLibraryForModal = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/libraries/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();

      // CRITICAL FIX: Ensure the library has all required fields
      const libraryData = data.library;
      if (!libraryData.platforms) libraryData.platforms = [];
      if (!libraryData.categories) libraryData.categories = [];
      if (!libraryData.industries) libraryData.industries = [];
      if (!libraryData.interactions) libraryData.interactions = [];

      setModalLibrary(libraryData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching library for modal:', error);
      const currentPath = window.location.pathname;
      const basePath = currentPath.includes('/browse') ? window.location.pathname.split('?')[0] : '/browse';
      window.history.replaceState({}, '', basePath + window.location.search);
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  }, []);

  // Check URL for library modal
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/library\/([^/]+)$/);

    if (pathMatch) {
      const librarySlug = pathMatch[1];
      if (!modalLibrary || modalLibrary.slug !== librarySlug) {
        fetchLibraryForModal(librarySlug);
      }
    } else if (isModalOpen && !window.location.pathname.startsWith('/library/')) {
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  }, [url, fetchLibraryForModal, modalLibrary, isModalOpen]);

  // UPDATED: Fetch libraries with pagination
const fetchLibraries = useCallback(async (page: number = 1, append: boolean = false) => {
  try {
    if (!append) {
      setIsLoadingLibraries(true);
    } else {
      setIsLoadingMore(true);
    }

    const params = new URLSearchParams();

    if (filterValue) {
      if (filterType === 'category') params.set('apps', filterValue);
      if (filterType === 'industry') params.set('industry', filterValue);
      if (filterType === 'interaction') params.set('interaction', filterValue);
    }

    params.set('page', page.toString());

    const response = await fetch(`/api/browse/libraries?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch libraries');
    }

    const data = await response.json();

    const librariesWithDefaults = data.libraries.map((lib: any) => ({
      ...lib,
      platforms: lib.platforms || [],
      categories: lib.categories || [],
      industries: lib.industries || [],
      interactions: lib.interactions || []
    }));

    const allLibrariesWithDefaults = data.allLibraries.map((lib: any) => ({
      ...lib,
      platforms: lib.platforms || [],
      categories: lib.categories || [],
      industries: lib.industries || [],
      interactions: lib.interactions || []
    }));

    if (append) {
      setLibraries(prev => [...prev, ...librariesWithDefaults]);
      setAllLibraries(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const newLibraries = allLibrariesWithDefaults.filter((lib: Library) => !existingIds.has(lib.id));
        return [...prev, ...newLibraries];
      });
    } else {
      setLibraries(librariesWithDefaults);
      setAllLibraries(allLibrariesWithDefaults);
    }

    setPagination(data.pagination);
  } catch (error) {
    console.error('Error fetching libraries:', error);
  } finally {
    setIsLoadingLibraries(false);
    setIsLoadingMore(false);
  }
}, [filterType, filterValue]);




const ensureSufficientLibrariesForSuggestions = useCallback(async (currentLibraryId: number) => {
  const currentIndex = allLibraries.findIndex(lib => lib.id === currentLibraryId);
  const remainingAfterCurrent = allLibraries.length - currentIndex - 1;

  // If we have less than 6 libraries after current, fetch more in background
  if (remainingAfterCurrent < 6 && pagination.has_more && !isFetchingMoreForSuggestions) {
    setIsFetchingMoreForSuggestions(true);
    try {
      const params = new URLSearchParams();
      if (filterValue) {
        if (filterType === 'category') params.set('apps', filterValue);
        if (filterType === 'industry') params.set('industry', filterValue);
        if (filterType === 'interaction') params.set('interaction', filterValue);
      }
      params.set('page', (pagination.current_page + 1).toString());

      const response = await fetch(`/api/browse/libraries?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newLibraries = data.allLibraries.map((lib: any) => ({
          ...lib,
          platforms: lib.platforms || [],
          categories: lib.categories || [],
          industries: lib.industries || [],
          interactions: lib.interactions || []
        }));

        setAllLibraries(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const uniqueNew = newLibraries.filter((lib: Library) => !existingIds.has(lib.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (error) {
      console.error('Error fetching more for suggestions:', error);
    } finally {
      setIsFetchingMoreForSuggestions(false);
    }
  }
}, [allLibraries, pagination, filterType, filterValue, isFetchingMoreForSuggestions]);


useEffect(() => {
  if (libraries.length > 0) {
    setAllLibraries(prev => {
      // Merge libraries into allLibraries
      const allIds = new Set(prev.map(l => l.id));
      const newLibs = libraries.filter(lib => !allIds.has(lib.id));

      if (newLibs.length > 0) {
        return [...prev, ...newLibs];
      }
      return prev;
    });
  }
}, [libraries]);


  // Initial fetch
  useEffect(() => {
    if (libraries.length === 0) {
      fetchLibraries(1, false);
    }
  }, [filterType, filterValue]);

  // Get current category data for CategoryHeader
  const currentCategory = useMemo(() => {
    if (filterType === 'category' && filterValue) {
      return filters.categories.find(cat => cat.slug === filterValue);
    }
    return null;
  }, [filterType, filterValue, filters.categories]);

  // Filter libraries based on search and platform (frontend)
  const filteredLibraries = useMemo(() => {
    let filtered = libraries;

    // Apply platform filter on frontend (instant filtering)
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(library =>
        library.platforms && library.platforms.some(platform =>
          platform.name.toLowerCase() === selectedPlatform.toLowerCase()
        )
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(library =>
        library.title.toLowerCase().includes(query) ||
        library.description?.toLowerCase().includes(query) ||
        (library.platforms && library.platforms.some(platform => platform.name.toLowerCase().includes(query))) ||
        (library.categories && library.categories.some(category => category.name.toLowerCase().includes(query))) ||
        (library.industries && library.industries.some(industry => industry.name.toLowerCase().includes(query))) ||
        (library.interactions && library.interactions.some(interaction => interaction.name.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [libraries, selectedPlatform, searchQuery]);

  const selectedPlatformLabel = useMemo(() => {
    if (selectedPlatform === 'all') {
      return '';
    }

    const matchedPlatform = filters?.platforms?.find(
      (platform) => platform.name.toLowerCase() === selectedPlatform.toLowerCase()
    );

    return matchedPlatform?.name || selectedPlatform;
  }, [filters?.platforms, selectedPlatform]);

  // Update displayed libraries when filteredLibraries changes
  useEffect(() => {
    setDisplayedLibraries(filteredLibraries);
  }, [filteredLibraries]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // NEW: Handle load more pagination
  const handleLoadMore = () => {
    if (pagination.has_more && !isLoadingMore) {
      fetchLibraries(pagination.current_page + 1, true);
    }
  };

  // UPDATED: Ensure library has full data structure before opening modal
const handleLibraryClick = useCallback(async (library: Library) => {
  const libraryWithDefaults = {
    ...library,
    platforms: library.platforms || [],
    categories: library.categories || [],
    industries: library.industries || [],
    interactions: library.interactions || []
  };

  setModalLibrary(libraryWithDefaults);
  setIsModalOpen(true);

  // Ensure we have enough libraries for suggestions
  ensureSufficientLibrariesForSuggestions(library.id);

  // Fetch full library data in background
  try {
    const response = await fetch(`/api/libraries/${library.slug}`);
    if (response.ok) {
      const data = await response.json();
      const fullLibrary = {
        ...data.library,
        platforms: data.library.platforms || [],
        categories: data.library.categories || [],
        industries: data.library.industries || [],
        interactions: data.library.interactions || []
      };
      setModalLibrary(fullLibrary);
    }
  } catch (error) {
    console.error('Error fetching full library data:', error);
  }
}, [ensureSufficientLibrariesForSuggestions]);



const effectiveAllLibraries = useMemo(() => {
  if (allLibraries.length === 0) {
    return libraries;
  }

  // If we need more libraries for smooth suggestions, duplicate the array
  // This creates a circular effect
  const minRequiredForSmooth = 20; // Minimum to ensure 6 suggestions always available

  if (allLibraries.length < minRequiredForSmooth && allLibraries.length > 0) {
    // Create circular array by repeating libraries
    const multiplier = Math.ceil(minRequiredForSmooth / allLibraries.length);
    const circularArray: Library[] = [];

    for (let i = 0; i < multiplier; i++) {
      circularArray.push(...allLibraries);
    }

    return circularArray;
  }

  return allLibraries;
}, [allLibraries, libraries]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
  };

  // UPDATED: Ensure library has full data structure for navigation
const handleLibraryNavigation = useCallback((library: Library) => {
  const libraryWithDefaults = {
    ...library,
    platforms: library.platforms || [],
    categories: library.categories || [],
    industries: library.industries || [],
    interactions: library.interactions || []
  };

  setModalLibrary(libraryWithDefaults);

  // Ensure we have enough libraries for next suggestions
  ensureSufficientLibrariesForSuggestions(library.id);
}, [ensureSufficientLibrariesForSuggestions]);

  const handleStarClick = (library: Library, isStarred: boolean) => {
    if (!authData.user) {
      console.log('User not authenticated');
      return;
    }
    console.log(`Library ${library.title} ${isStarred ? 'starred' : 'unstarred'}`);
  };

  // Filter handlers - platform filtering happens instantly on frontend
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

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

  return (
    <>
      <Head title={getPageTitle()} />
      <LayoutUnauth
        libraries={libraries}
        currentRoute={url}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
        settings={settings}
        isAuthenticated={isAuthenticated}
      >

        {/* Header Section */}
        <div className="bg-[#F8F8F9] dark:bg-gray-900 font-sora">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6 font-sora">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-3xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {filterName || 'All Libraries'}
                </h1>
              </div>

              <div className="text-left sm:text-right sm:mr-8 md:mr-6">
                <div className="text-[#BABABA] dark:text-gray-400 text-xs sm:text-xs md:text-[11px]">
                  Showing
                </div>
                <div className="text-[#2E241C] dark:text-gray-400 text-sm sm:text-sm md:text-[13px] mt-1 font-semibold">
                  {!isAuthenticated && pagination.total > 18
                    ? `${Math.min(displayedLibraries.length, 18)} of ${pagination.total} Results`
                    : `${pagination.total} ${pagination.total === 1 ? 'Result' : 'Results'}`
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

            <div className="max-w-full px-4 sm:px-6 md:px-7 lg:px-6 mx-auto sticky top-[60px] md:top-[75px] lg:top-[75px] z-10">
              <FilterSection
                filters={filters}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                cardsPerRow={cardsPerRow}
                onCardsPerRowChange={handleCardsPerRowChange}
              />
            </div>

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
            {currentCategory && filterType === 'category' && categoryData && (
              <CategoryHeader
                category={categoryData}
                auth={authData}
                ziggy={ziggyData}
              />
            )}

            <div className="max-w-full px-4 sm:px-6 md:px-7 lg:px-6 mx-auto sticky top-[65px] md:top-[80px] lg:top-[80px] z-10">
              <FilterSection
                filters={filters}
                selectedPlatform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
                cardsPerRow={cardsPerRow}
                onCardsPerRowChange={handleCardsPerRowChange}
              />
            </div>

            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16 pt-4 sm:pt-8 md:pt-6">
              <LibraryGrid
                ziggy={ziggyData}
                libraries={displayedLibraries}
                onLibraryClick={handleLibraryClick}
                onLoadMore={pagination.has_more ? handleLoadMore : undefined}
                hasMore={pagination.has_more}
                isLoading={isLoadingMore}
                cardsPerRow={cardsPerRow}
                auth={authData}
                onStarClick={handleStarClick}
                userLibraryIds={userLibraryIds}
                viewedLibraryIds={viewedLibraryIds}
                onLibraryViewed={handleLibraryViewed}
                userPlanLimits={userPlanLimits}
              />
            </div>

            {filteredLibraries.length === 0 && !isLoadingLibraries && (
              <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16">
                <div className="text-center py-8 sm:py-12 md:py-10 font-sora px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-5">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-[22px] font-sora !font-bold text-[#2B235A] dark:text-white mb-2">
                    {selectedPlatformLabel
                      ? `No libraries found for ${selectedPlatformLabel}`
                      : 'No libraries found'}
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

        <LibraryModal
          library={modalLibrary}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onClick={handleLibraryClick}
          allLibraries={effectiveAllLibraries}
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
      </LayoutUnauth>
    </>
  );
};

export default Browse;
