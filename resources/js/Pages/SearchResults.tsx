import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryGrid from './LibraryGrid';
import LibraryModal from './LibraryModal';
import FilterSection from './Website/Components/FilterSection';
import Layout from './Layout';

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
  categories: Array<{ id: number; name: string }>;
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  created_at: string;
  published_date: string;
}

interface SearchResultsProps extends PageProps {
  libraries: Library[];
  searchQuery: string;
  selectedPlatform: string;
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  isAuthenticated: boolean;
  userPlanLimits?: UserPlanLimits | null;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const SearchResults: React.FC<SearchResultsProps> = ({
  libraries: initialLibraries = [],
  searchQuery,
  selectedPlatform,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  totalCount: initialTotalCount,
  hasMore: initialHasMore,
  currentPage: initialCurrentPage,
  isAuthenticated: initialIsAuthenticated = false,
  filters,
  userPlanLimits,
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isAuthenticated = initialIsAuthenticated || !!authData?.user;

  const [currentQuery, setCurrentQuery] = useState(searchQuery);
  const [activePlatform, setActivePlatform] = useState(selectedPlatform || 'all');
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(initialLibraries.length === 0 && searchQuery.trim() !== '');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

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

  // Fetch search results after navigation (NEW - for instant navigation)
  useEffect(() => {
    const fetchSearchResults = async () => {
      // Don't fetch if no query or already have data
      if (!searchQuery.trim()) {
        setIsLoadingLibraries(false);
        return;
      }

      if (libraries.length > 0) {
        setIsLoadingLibraries(false);
        return;
      }

      try {
        setIsLoadingLibraries(true);

        const params = new URLSearchParams();
        params.set('q', searchQuery);

        if (activePlatform && activePlatform !== 'all') {
          params.set('platform', activePlatform);
        }

        params.set('page', '1');

        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();

        setLibraries(data.libraries);
        setHasMore(data.has_more);
        setCurrentPage(data.current_page);
        setTotalCount(data.total_count);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoadingLibraries(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]); // Re-fetch when search query changes

  // Re-fetch when platform filter changes
  useEffect(() => {
    if (!searchQuery.trim() || libraries.length === 0) return;

    const fetchFilteredResults = async () => {
      try {
        setIsLoadingLibraries(true);

        const params = new URLSearchParams();
        params.set('q', searchQuery);

        if (activePlatform && activePlatform !== 'all') {
          params.set('platform', activePlatform);
        }

        params.set('page', '1');

        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();

        setLibraries(data.libraries);
        setHasMore(data.has_more);
        setCurrentPage(data.current_page);
        setTotalCount(data.total_count);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoadingLibraries(false);
      }
    };

    fetchFilteredResults();
  }, [activePlatform]);

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
      window.history.replaceState({}, '', '/search' + window.location.search);
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    if (query.trim()) {
      router.get('/search', {
        q: query,
        platform: activePlatform !== 'all' ? activePlatform : ''
      });
    }
  };

  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
    // Don't use router.get here, let the useEffect handle the API call
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

  const handleLibraryClick = (library: Library) => {
    setModalLibrary(library);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
  };

  const handleLibraryNavigation = (library: Library) => {
    setModalLibrary(library);
  };

  const handleStarClick = (library: Library, isStarred: boolean) => {
    if (!authData.user) {
      console.log('User not authenticated');
      return;
    }
    console.log(`Library ${library.title} ${isStarred ? 'starred' : 'unstarred'}`);
  };

  const loadMoreResults = useCallback(async () => {
    if (!isAuthenticated || !hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/search/load-more?q=${encodeURIComponent(currentQuery)}&platform=${activePlatform !== 'all' ? activePlatform : ''}&page=${currentPage + 1}`);
      const data = await response.json();

      if (data.libraries && data.libraries.length > 0) {
        setLibraries(prev => [...prev, ...data.libraries]);
        setCurrentPage(data.current_page);
        setHasMore(data.has_more);

        if (data.viewedLibraryIds) {
          setViewedLibraryIds(data.viewedLibraryIds);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more results:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isAuthenticated, hasMore, isLoadingMore, isLoading, currentQuery, activePlatform, currentPage]);

  return (
    <Layout
      currentRoute="/search"
      onSearch={handleSearch}
      searchQuery={currentQuery}
      filters={filters}
      libraries={libraries}
      auth={authData}
      ziggy={ziggyData}
      userPlanLimits={userPlanLimits}
      userLibraryIds={userLibraryIds}
      viewedLibraryIds={viewedLibraryIds}
      onLibraryViewed={handleLibraryViewed}
    >
      <Head title={`Search Results for "${searchQuery}"`} />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sora">
        {/* Search Header - Shows immediately */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results for "{searchQuery}"
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {!isAuthenticated && totalCount > 18
              ? `Showing 18 of ${totalCount} results`
              : `${totalCount} ${totalCount === 1 ? 'result' : 'results'} found`
            }
          </p>
        </div>

        {/* Filter Section - Shows immediately */}
        <div className="sticky top-16 md:top-20 lg:top-20 z-10 mb-2 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <FilterSection
            filters={filters}
            selectedPlatform={activePlatform}
            onPlatformChange={handlePlatformChange}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={handleCardsPerRowChange}
          />
        </div>

        {/* Loading state or results */}
        {isLoadingLibraries ? (
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
        ) : (
          <>
            {libraries.length > 0 || currentQuery.trim() ? (
              <LibraryGrid
                ziggy={ziggyData}
                libraries={libraries}
                onLibraryClick={handleLibraryClick}
                onLoadMore={loadMoreResults}
                hasMore={isAuthenticated ? hasMore : false}
                isLoading={isLoadingMore}
                cardsPerRow={cardsPerRow}
                auth={authData}
                onStarClick={handleStarClick}
                userLibraryIds={userLibraryIds}
                viewedLibraryIds={viewedLibraryIds}
                onLibraryViewed={handleLibraryViewed}
                userPlanLimits={userPlanLimits}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start searching
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a search query to find interactions.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Library Modal */}
      <LibraryModal
        library={modalLibrary}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onClick={handleLibraryClick}
        allLibraries={libraries}
        onNavigate={handleLibraryNavigation}
        onStarClick={handleStarClick}
        auth={authData}
        ziggy={ziggyData}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
        filters={filters}
        userPlanLimits={userPlanLimits}
      />
    </Layout>
  );
};

export default SearchResults;
