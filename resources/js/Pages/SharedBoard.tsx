import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Share2, ChevronRight, Home, Lock, Mail } from 'lucide-react';
import Layout from './Layout';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import LibraryModal from './LibraryModal';
import FilterSection from './Website/Components/FilterSection';
import LayoutUnauth from './LayoutUnauth';

interface Category {
  id: number;
  name: string;
  image?: string;
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
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  created_at: string;
  published_date:string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Board {
  id: number;
  name: string;
  creator_email: string;
  creator_name: string;
  visibility: 'public' | 'private';
  created_at: string;
}


interface Settings {
  emails: string[];
  phones: string[];
  addresses: string[];
  copyright_text?: string;
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
  hero_image?: string;
}

interface SharedBoardProps extends PageProps {
  board: Board;
  libraries: Library[];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  userPlanLimits?: UserPlanLimits | null;
  isPrivate?: boolean;
  isOwner?: boolean;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  settings?: Settings;
}

const SharedBoard: React.FC<SharedBoardProps> = ({
  board,
  libraries,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  userPlanLimits,
  isPrivate = false,
  isOwner = false,
  filters,
    settings,
}) => {
  const { url, props } = usePage<PageProps>();
  const authData = props.auth;
  const ziggyData = props.ziggy;

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);

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

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(2);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [url, modalLibrary, isModalOpen]);

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
      window.history.replaceState({}, '', window.location.pathname.replace(/\/library\/[^/]+$/, ''));
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  const searchFilteredLibraries = useMemo(() => {
    let filtered = libraries;

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

  const finalFilteredLibraries = useMemo(() => {
    let filtered = searchFilteredLibraries;

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(library =>
        library.platforms.some(platform => {
          if (!isNaN(Number(selectedPlatform))) {
            return platform.id.toString() === selectedPlatform;
          }
          return platform.name.toLowerCase() === selectedPlatform.toLowerCase();
        })
      );
    }

    return filtered;
  }, [searchFilteredLibraries, selectedPlatform]);

  useEffect(() => {
    setDisplayedLibraries(finalFilteredLibraries.slice(0, itemsToShow));
  }, [finalFilteredLibraries, itemsToShow]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setItemsToShow(12);
  };

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 12);
  };

  const handleLibraryClick = (library: Library) => {
    setModalLibrary(library);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
  };

  const handleModalNavigation = (library: Library) => {
    setModalLibrary(library);
  };

  const handleStarClick = (library: Library, isStarred: boolean) => {
    if (!authData.user) {
      console.log('User not authenticated');
      return;
    }
    console.log(`Library ${library.title} ${isStarred ? 'starred' : 'unstarred'}`);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setItemsToShow(12);
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

  const hasMore = displayedLibraries.length < finalFilteredLibraries.length;

  // If board is private and user is not owner, show access denied
  if (isPrivate && !isOwner) {
    return (
      <>
        <Head title={`${board.name} - Private Collection`} />
        <LayoutUnauth
          currentRoute="collections"
          onSearch={() => {}}
          searchQuery=""
          filters={filters || { platforms: [], categories: [], industries: [], interactions: [] }}
          libraries={[]}
          auth={authData}
          settings={settings}
          ziggy={ziggyData}
          userPlanLimits={userPlanLimits}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
          isAuthenticated={!!authData.user}
        >
          {/* Header Section */}
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
                <span className="text-sm sm:text-lg md:text-base font-semibold">Shared Board</span>
              </nav>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-3xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {board.name}
                  </h1>
                  <div className="flex items-center gap-1 px-2 sm:px-3 md:px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs sm:text-sm md:text-[13px]">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Private</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-[13px] text-gray-600 dark:text-gray-400">
                  Shared by {board.creator_name} (@{board.creator_email})
                </p>
              </div>
            </div>
          </div>

          {/* Private Access Message */}
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16 pt-4 sm:pt-8 md:pt-6 font-sora">
            <div className="flex items-center justify-center min-h-[50vh] px-4">
              <div className="text-center max-w-md">
                <div className="mb-6 sm:mb-8 md:mb-7 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 bg-gray-100 rounded-full">
                  <Lock className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 text-gray-600" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-[22px] font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-3.5">
                  This Collection is Private
                </h3>
                <p className="text-sm sm:text-base md:text-[15px] text-gray-600 mb-6 sm:mb-8 md:mb-7 leading-relaxed">
                  This collection is currently set to private. Please contact the collection owner at{' '}
                  <span className="font-medium text-gray-900">{board.creator_email}</span> to request access
                  or ask them to change the visibility to public.
                </p>
                <a
                  href={`mailto:${board.creator_email}?subject=Access Request for "${board.name}" Collection&body=Hi ${board.creator_name},%0D%0A%0D%0AI would like to request access to your "${board.name}" collection. Could you please make it public or grant me access?%0D%0A%0D%0AThank you!`}
                  className="inline-flex items-center gap-2 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-5 md:px-4.5 py-2.5 sm:py-3 md:py-2.5 rounded-md hover:opacity-95 transition-opacity duration-300 font-medium text-sm sm:text-base md:text-[15px] focus:outline-none focus:ring-0"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 z-10" />
                  <span className='z-10'>
                    Contact Creator
                  </span>
                </a>
              </div>
            </div>
          </div>
        </LayoutUnauth>
      </>
    );
  }

  // Normal shared board view (public or owner viewing)
  return (
    <>
      <Head title={`${board.name} - Shared Collection`} />
      <LayoutUnauth
        currentRoute="collections"
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters || { platforms: [], categories: [], industries: [], interactions: [] }}
        libraries={libraries}
        auth={authData}
        ziggy={ziggyData}
        settings={settings}
        userPlanLimits={userPlanLimits}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
        isAuthenticated={!!authData.user}
      >
        {/* Header Section */}
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
              <span className="text-sm sm:text-lg md:text-base font-semibold">Shared Board</span>
            </nav>

            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-3xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {board.name}
                </h1>
                <p className="text-xs sm:text-sm md:text-[13px] text-gray-600 dark:text-gray-400">
                  Shared by {board.creator_name} (@{board.creator_email})
                </p>
              </div>

              {/* Right side - Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-3">
                <div className="text-left sm:text-right sm:mr-8 md:mr-6">
                  <div className="text-[#BABABA] dark:text-gray-400 text-xs sm:text-xs md:text-[11px]">
                    {finalFilteredLibraries.length !== libraries.length ? 'Showing' : 'Showing'}
                  </div>
                  <div className="text-[#2E241C] dark:text-gray-400 text-sm sm:text-sm md:text-[13px] mt-1 font-semibold">
                    {finalFilteredLibraries.length !== libraries.length
                      ? `${finalFilteredLibraries.length} of ${libraries.length} interactions`
                      : `${libraries.length} interaction${libraries.length !== 1 ? 's' : ''}`
                    }
                    {searchQuery && ` for "${searchQuery}"`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-full px-4 sm:px-6 md:px-7 lg:px-6 mx-auto sticky top-[60px] md:top-[75px] lg:top-[75px] z-10">
          <FilterSection
            filters={filters || { platforms: [], categories: [], industries: [], interactions: [] }}
            selectedPlatform={selectedPlatform}
            onPlatformChange={handlePlatformChange}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={handleCardsPerRowChange}
          />
        </div>

        {/* Libraries Grid */}
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 pb-12 sm:pb-20 md:pb-16 pt-4 sm:pt-8 md:pt-6">
          {displayedLibraries.length > 0 ? (
            <>
              <div className={`grid gap-4 sm:gap-6 md:gap-5 p-3 sm:p-6 md:p-5 ${
                cardsPerRow === 2 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2' :
                cardsPerRow === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {displayedLibraries.map((library) => (
                  <LibraryCard
                    ziggy={ziggyData}
                    key={library.id}
                    library={library}
                    auth={authData}
                    onLoadMore={hasMore ? handleLoadMore : undefined}
                    hasMore={hasMore}
                    isLoading={false}
                    cardsPerRow={cardsPerRow}
                    onStarClick={handleStarClick}
                    onClick={handleLibraryClick}
                    userLibraryIds={userLibraryIds}
                    viewedLibraryIds={viewedLibraryIds}
                    onLibraryViewed={handleLibraryViewed}
                    userPlanLimits={userPlanLimits}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8 sm:mt-12 md:mt-10">
                  <button
                    onClick={handleLoadMore}
                    className="bg-[#2B235A] text-white px-6 sm:px-8 md:px-7 py-2.5 sm:py-3 md:py-2.5 rounded-lg hover:bg-black transition-colors font-medium text-sm sm:text-base md:text-[15px]"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-8 sm:py-12 md:py-10 font-sora px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-5">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-[22px] font-sora !font-bold text-[#2B235A] dark:text-white mb-2">
                No interactions found
              </h3>
              <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 max-w-md mx-auto mb-4 sm:mb-6 md:mb-5">
                {searchQuery || selectedPlatform !== 'all'
                  ? 'No interactions match your current filters in this collection.'
                  : 'This collection is currently empty.'
                }
              </p>
              {(searchQuery || selectedPlatform !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPlatform('all');
                    setItemsToShow(12);
                  }}
                  className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                >
                    <span className='z-10'>
                        Clear All Filters
                    </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Library Modal */}
        <LibraryModal
          library={modalLibrary}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onClick={handleLibraryClick}
          allLibraries={displayedLibraries}
          onNavigate={handleModalNavigation}
          onStarClick={handleStarClick}
          auth={authData}
          ziggy={ziggyData}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
          filters={filters}
          board={board}
          isSharedBoard={true}
          userPlanLimits={userPlanLimits}
        />
      </LayoutUnauth>
    </>
  );
};

export default SharedBoard;
