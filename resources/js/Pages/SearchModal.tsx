import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import LibraryModal from './LibraryModal';
import FilterSection from './Website/Components/FilterSection';
import { Infinity } from 'lucide-react';

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

interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
}

interface Library {
  id: number;
  title: string;
  slug: string;
  url: string;
  video_url: string;
  description?: string;
  logo?: string;
  platforms: Array<{ id: number; name: string; slug?: string }>;
  categories: Category[];
  industries: Array<{ id: number; name: string; slug?: string }>;
  interactions: Array<{ id: number; name: string; slug?: string }>;
  created_at: string;
  published_date:string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  libraries: Library[];
  userPlanLimits?: UserPlanLimits | null;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  auth: PageProps['auth'];
  ziggy?: PageProps['ziggy'];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  libraries: initialLibraries,
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  filters,
  auth,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onLibraryViewed,
  userPlanLimits,
}) => {
  const { url, props } = usePage<PageProps>();
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries || []);
  const [results, setResults] = useState<Library[]>([]);
  const [allResults, setAllResults] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auth data and authentication check
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isAuthenticated = !!authData?.user;

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  // UPDATED: Check URL for library modal - now checks path instead of query parameter
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
      // Keep search modal open, just close the library modal
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSelectedResultIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() && isOpen) {
      setResults([]);
      setAllResults([]);
      setCurrentPage(1);
      setHasMore(false);
      setTotalCount(0);
      setSelectedResultIndex(-1);
      searchLibraries(1, true);
    } else {
      setResults([]);
      setAllResults([]);
      setHasMore(false);
      setCurrentPage(1);
      setTotalCount(0);
      setSelectedResultIndex(-1);
    }
  }, [searchQuery, selectedPlatform, isOpen]);

  const searchLibraries = async (page: number = 1, isNewSearch: boolean = false) => {
    if (!searchQuery.trim()) return;

    if (isNewSearch) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
      });

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const newLibraries = data.libraries || [];

      if (isNewSearch) {
        setAllResults(newLibraries);

        if (isAuthenticated) {
          // For authenticated users, show all results with pagination
          setResults(newLibraries);
        } else {
          // For unauthenticated users, limit to 12 results
          setResults(newLibraries.slice(0, 18));
        }
      } else {
        // This only applies to authenticated users (infinite scroll)
        if (isAuthenticated) {
          setAllResults(prev => [...prev, ...newLibraries]);
          setResults(prev => [...prev, ...newLibraries]);
        }
      }

      // For unauthenticated users, disable pagination after 12 results
      if (!isAuthenticated) {
        setHasMore(false);
      } else {
        setHasMore(data.has_more || false);
      }

      setCurrentPage(data.current_page || 1);
      setTotalCount(data.total_count || 0);
    } catch (error) {
      console.error('Search failed:', error);
      if (isNewSearch) {
        setResults([]);
        setAllResults([]);
      }
      setHasMore(false);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreResults = useCallback(() => {
    // Only allow infinite scroll for authenticated users
    if (isAuthenticated && hasMore && !isLoadingMore && !isLoading) {
      searchLibraries(currentPage + 1, false);
    }
  }, [isAuthenticated, hasMore, isLoadingMore, isLoading, currentPage, searchQuery, selectedPlatform]);

  const handleScroll = useCallback(() => {
    // Only handle scroll for authenticated users
    if (!isAuthenticated) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMore && !isLoadingMore && !isLoading) {
      loadMoreResults();
    }
  }, [isAuthenticated, loadMoreResults, hasMore, isLoadingMore, isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.visit('/search', {
          method: 'get',
          data: {
            q: searchQuery,
            platform: selectedPlatform !== 'all' ? selectedPlatform : ''
          }
        });
        onClose();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex < results.length ? nextIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => {
        const nextIndex = prev - 1;
        return nextIndex >= 0 ? nextIndex : -1;
      });
    } else if (e.key === 'Tab' && selectedResultIndex >= 0) {
      e.preventDefault();
      handleLibraryClick(results[selectedResultIndex]);
    }
  };

  // UPDATED: Handle library click - URL update is handled by LibraryCard
  const handleLibraryClick = (library: Library) => {
    setModalLibrary(library);
    setIsModalOpen(true);
    // URL update is handled by LibraryCard component
  };

  // UPDATED: Handle modal close - URL update is handled by LibraryModal
  const handleLibraryModalClose = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
    // URL update is handled by LibraryModal component
  };

  // UPDATED: Handle modal navigation - URL is handled by LibraryModal
  const handleLibraryNavigation = (library: Library) => {
    setModalLibrary(library);
    // URL update is handled by LibraryModal component
  };

  const handleStarClick = (library: Library, isStarred: boolean) => {
    if (!authData.user) {
      router.visit(route('login'));
      return;
    }

    console.log('Star clicked for library:', library.title, 'isStarred:', isStarred);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setSelectedResultIndex(-1);
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.visit('/search', {
        method: 'get',
        data: {
          q: searchQuery,
          platform: selectedPlatform !== 'all' ? selectedPlatform : ''
        }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const getGridClasses = () => {
    if (cardsPerRow === 2) {
      return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    } else {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  // Check if we should show the login prompt
  const showLoginPrompt = !isAuthenticated && totalCount > 18;

  return (
    <>
      <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-start justify-center sm:pt-20 pt-4 focus:outline-none px-2 sm:px-4">
        <div className="bg-[#F8F8F9] dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[80vh] overflow-hidden flex flex-col focus:outline-none">
          {/* Header */}
          <div className="p-3 sm:p-4 dark:border-gray-700">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#2B235A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Try searching 'Hover Effect'"
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-[#F5F5FA] dark:bg-gray-800 border border-[#CECCFF] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-0 focus:border-[#CECCFF] dark:focus:border-gray-700 outline-none ring-0 font-sora text-[#2B235A] dark:text-white placeholder-[#2B235A] dark:placeholder-gray-400"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Filter Section */}
          <FilterSection
            filters={filters}
            selectedPlatform={selectedPlatform}
            onPlatformChange={handlePlatformChange}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={handleCardsPerRowChange}
          />

          {/* Results Count */}
          {totalCount > 0 && (
            <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs sm:text-sm text-[#443B82] font-sora dark:text-gray-400">
                  {!isAuthenticated && totalCount > 18
                    ? `Showing 18 of ${totalCount} results`
                    : `${totalCount} ${totalCount === 1 ? 'result' : 'results'} found`
                  }
                </p>
                {isAuthenticated && (
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs sm:text-sm text-[#443B82] dark:text-white hover:text-black dark:hover:text-blue-300 font-sora !font-medium focus:outline-none focus:ring-0"
                  >
                    View all results →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 border-t-[#260F63] rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Searching...</span>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-3 sm:p-4">
                <div className={getGridClasses()}>
                  {results.map((library, index) => (
                    <div
                      key={library.id}
                      className={`${
                        selectedResultIndex === index ? 'ring-2 ring-[#260F63]' : ''
                      }`}
                    >
                      <LibraryCard
                        ziggy={ziggyData}
                        library={library}
                        onClick={handleLibraryClick}
                        auth={authData}
                        onStarClick={handleStarClick}
                        cardsPerRow={cardsPerRow}
                        userLibraryIds={userLibraryIds}
                        userPlanLimits={userPlanLimits}
                        viewedLibraryIds={viewedLibraryIds}
                        onLibraryViewed={onLibraryViewed}
                      />
                    </div>
                  ))}
                </div>

                {/* Unauthenticated User Login Prompt - Exact same as LibraryGrid */}
                {showLoginPrompt && (
                <div
                    className="relative -mt-[500px] pt-80 pb-10 text-center flex flex-col items-center justify-center px-4 rounded-2xl"
                    style={{
                    background:
                        "linear-gradient(to top, #F8F8F9 0%, rgba(248, 248, 249, 1) 60%, rgba(248, 248, 249, 0.7) 80%, rgba(248, 248, 249, 0.2) 100%)",
                    }}
                >


                    <div className="relative z-10">
                    <h2 className="font-sora !text-3xl sm:!text-4xl pt-10 !font-normal text-[#77778F] dark:text-white mb-2">
                        You're{" "}
                        <span className="font-extrabold bg-gradient-to-r from-[#271960] to-[#4226B2] bg-clip-text text-transparent">
                        one click away{" "}
                        </span>
                        from
                    </h2>

                    <p className="font-sora text-2xl sm:text-3xl !font-normal text-[#77778F] dark:text-gray-400 mb-6">
                        unlimited inspiration
                    </p>

                    <p className="max-w-sm text-sm sm:text-sm text-[#828287] dark:text-gray-400 mb-8 text-center font-poppins mx-auto">
                        Explore thousands of real UI animations, thoughtfully curated for modern
                        design teams
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-16">
                        <Link
                        href="/login"
                        className="px-6 py-2 holographic-link2 bg-[#F2EDFF] border border-[#CECCFF] rounded-[4px] font-sora text-base !font-semibold text-[#2B235A] hover:opacity-95 transition-opacity duration-500 focus:outline-none focus:ring-0"
                        >
                        <span className="z-10">Log In</span>
                        </Link>

                        <Link
                        href="/register"
                        className="px-6 py-2 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] font-sora text-base text-white rounded-[4px] !font-semibold hover:opacity-95 transition-opacity duration-500 shadow-[4px_4px_12px_0px_#260F6329] focus:outline-none focus:ring-0"
                        >
                        <span className="z-10">Join Free</span>
                        </Link>
                    </div>

                    <p className="text-base text-[#878787] dark:text-gray-500 mb-6 font-sora">
                        Where designers from the world's leading teams spark interaction ideas
                    </p>

                    {/* === Smooth scrolling logo section === */}
                    <style>{`
                        @keyframes scroll-infinite {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                        }
                        .scroll-container {
                        animation: scroll-infinite 30s linear infinite;
                        display: flex;
                        width: fit-content;
                        }
                        .scroll-container:hover {
                        animation-play-state: paused;
                        }
                    `}</style>

                    <div className="overflow-hidden w-full max-w-4xl mx-auto relative">
                        <div className="scroll-container">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center gap-8 shrink-0 px-3">
                            {[
                                { src: "images/brand/atlas.png", alt: "Atlassian" },
                                { src: "images/brand/air.png", alt: "Airbnb" },
                                { src: "images/brand/monday.png", alt: "Monday" },
                                { src: "images/brand/klarna.png", alt: "Klarna" },
                                { src: "images/brand/spotify.png", alt: "Spotify" },
                                { src: "images/brand/plaid.png", alt: "Plaid" },
                                { src: "images/brand/linktree.png", alt: "Linktree" },
                            ].map((brand, index) => (
                                <div
                                key={index}
                                className="flex items-center justify-center w-24 h-10 bg-transparent"
                                >
                                <img
                                    src={brand.src}
                                    alt={brand.alt}
                                    className="max-h-full max-w-full object-contain"
                                />
                                </div>
                            ))}
                            </div>
                        ))}
                        </div>

                        {/* Optional fade edges for premium look */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F6F5FA] dark:from-gray-900 to-transparent"></div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F6F5FA] dark:from-gray-900 to-transparent"></div>
                    </div>
                    </div>
                </div>
                )}

                {/* Loading More Indicator - Only for authenticated users */}
                {isAuthenticated && isLoadingMore && (
                  <div className="flex justify-center items-center py-6 sm:py-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-[#260F63] rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading more...</span>
                    </div>
                  </div>
                )}

                {/* Show All Results Button - Only for authenticated users */}
                {isAuthenticated && results.length > 0 && (
                  <div className="text-center py-4 sm:py-6">
                    <button
                      onClick={handleSearchSubmit}
                      className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:bg-[#1A04B0] font-sora text-white !font-medium rounded-lg transition-colors focus:outline-none focus:ring-0"
                    >
                      <span>View all {totalCount} results</span>
                      <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* End of Results - Only for authenticated users */}
                {isAuthenticated && !hasMore && results.length > 0 && totalCount > results.length && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
                      Showing {results.length} of {totalCount} results
                    </p>
                  </div>
                )}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-8 sm:py-12 font-sora px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg !font-medium text-[#2B235A] dark:text-white mb-2 font sora">
                  No results found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Try searching for different keywords or check your spelling.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 font-sora px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#2B235A] dark:text-white mb-2">
                  Start searching
                </h3>
                <p className="text-sm sm:text-base text-[#443B82] dark:text-gray-400">
                  Type to search through our library of interactions.
                </p>
                <p className="text-xs sm:text-sm text-[#443B82] dark:text-gray-500 mt-2">
                  Press Enter to see all results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Library Modal */}
      <LibraryModal
        library={modalLibrary}
        isOpen={isModalOpen}
        onClose={handleLibraryModalClose}
        onClick={handleLibraryClick}
        allLibraries={results}
        onNavigate={handleLibraryNavigation}
        onStarClick={handleStarClick}
        auth={authData}
        ziggy={ziggyData}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={onLibraryViewed}
        filters={filters}
        userPlanLimits={userPlanLimits}
      />
    </>
  );
};

export default SearchModal;
