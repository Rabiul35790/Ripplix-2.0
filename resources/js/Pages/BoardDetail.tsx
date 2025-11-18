import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { ArrowLeft, Share2, Edit2, Check, ChevronRight, Home, Crown, Lock } from 'lucide-react';
import Layout from './Layout';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import LibraryModal from './LibraryModal';
import FilterSection from './Website/Components/FilterSection';
import PricingModal from './PricingModal';

interface Category {
  id: number;
  name: string;
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
  platforms: Array<{ id: number; name: string }>;
  categories: Category[];
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  is_blurred?: boolean;
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
  visibility: 'public' | 'private';
  share_via_link: boolean;
  share_via_email: boolean;
  share_url?: string | null;
  share_emails?: string[];
  created_at: string;
  libraries_count?: number;
  category_images?: string[];
  is_blurred?: boolean;
  libraries?: Array<{
    id: number;
    title: string;
    video_url: string;
  }>;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface BoardDetailProps extends PageProps {
  board: Board;
  libraries: Library[];
  selectedLibrary?: Library | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[]; // ADD THIS
  userPlanLimits?: UserPlanLimits | null;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const BoardDetail: React.FC<BoardDetailProps> = ({
  board,
  libraries,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [], // ADD THIS
  userPlanLimits,
  filters
}) => {
  const { url, props } = usePage<PageProps>();
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const authData = props.auth;
  const ziggyData = props.ziggy;

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(2);

  // ADD THIS: State for userLibraryIds
  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);

  // ADD THIS: State for viewedLibraryIds with real-time updates
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

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
      // Avoid duplicates
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

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
      // Redirect back to board detail page if library not found
      window.history.replaceState({}, '', window.location.pathname.replace(/\/library\/[^/]+$/, ''));
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  // Separate visible and blurred libraries for free users
  const { visibleLibraries, blurredLibraries } = useMemo(() => {
    const visible: Library[] = [];
    const blurred: Library[] = [];

    libraries.forEach((library, index) => {
      if (userPlanLimits?.isFree && index >= userPlanLimits.maxLibrariesPerBoard) {
        blurred.push({ ...library, is_blurred: true });
      } else {
        visible.push(library);
      }
    });

    return { visibleLibraries: visible, blurredLibraries: blurred };
  }, [libraries, userPlanLimits]);

  // Filter libraries based on search query
  const searchFilteredLibraries = useMemo(() => {
    let filtered = visibleLibraries; // Only filter visible libraries for free users

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
  }, [visibleLibraries, searchQuery]);

  // Apply platform filter on top of search filtered libraries
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

  // Update displayed libraries when finalFilteredLibraries or itemsToShow changes
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

  // UPDATED: Handle library click - URL update is handled by LibraryCard
  const handleLibraryClick = (library: Library) => {
    // Don't open modal for blurred libraries
    if (library.is_blurred) {
      setIsPricingModalOpen(true);
      return;
    }
    setModalLibrary(library);
    setIsModalOpen(true);
    // URL update is handled by LibraryCard component
  };

  // UPDATED: Handle close modal - URL update is handled by LibraryModal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalLibrary(null);
    // URL update is handled by LibraryModal component
  };

  // UPDATED: Handle modal navigation - URL is handled by LibraryModal
  const handleModalNavigation = (library: Library) => {
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

  const handleUpgradeClick = () => {
    setIsPricingModalOpen(true);
  };

  const handlePricingModalClose = () => {
    setIsPricingModalOpen(false);
  };

  // Filter handlers
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setItemsToShow(12);
  };

  const handleCardsPerRowChange = (count: number) => {
    setCardsPerRow(count);
  };

  const hasMore = displayedLibraries.length < finalFilteredLibraries.length;
  const totalLibrariesCount = visibleLibraries.length + blurredLibraries.length;

  const copyShareLink = async () => {
    try {
      if (!userPlanLimits?.canShare) {
        setIsPricingModalOpen(true);
        return;
      }

      await navigator.clipboard.writeText(board.share_url || '');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <>
      <Head title={`${board.name} - Collections`} />
      <Layout
        currentRoute="collections"
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters || { platforms: [], categories: [], industries: [], interactions: [] }}
        libraries={libraries}
        auth={authData}
        ziggy={ziggyData}
        userPlanLimits={userPlanLimits}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
      >
        {/* Header Section */}
        <div className="bg-[#F8F8F9] dark:bg-gray-900 font-sora">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6 font-sora">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 text-sm text-[#BABABA] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5">
              <Link
                href="/"
                className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors duration-500"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
              </Link>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
              <Link
                href="/collections"
                className="hover:text-gray-700 dark:hover:text-gray-300 text-sm sm:text-lg md:text-base font-semibold focus:outline-none focus:ring-0 transition-colors duration-300 ease-in-out"
              >
                Collections
              </Link>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
            </nav>

            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-3">
                <h1 className="text-xl sm:text-3xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {board.name}
                </h1>
                {userPlanLimits?.isFree && (
                  <div className="flex items-center gap-2 px-2 sm:px-3 md:px-2.5 py-1 bg-[#EEE4FF] border border-[#CDA0FA] rounded-full text-xs sm:text-sm md:text-[13px] w-fit">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-[#9943EE] fill-current" />
                    <span className="text-[#2B235A] font-medium">
                      {userPlanLimits.planName} ({visibleLibraries.length}/{userPlanLimits.maxLibrariesPerBoard})
                    </span>
                  </div>
                )}
              </div>

              {/* Right side - Stats and Share Button */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-3">
                <div className="text-left sm:text-right sm:mr-8 md:mr-6">
                  <div className="text-[#BABABA] dark:text-gray-400 text-xs sm:text-xs md:text-[11px]">
                    {finalFilteredLibraries.length !== visibleLibraries.length ? 'Showing' : 'Added'}
                  </div>
                  <div className="text-[#2E241C] dark:text-gray-400 text-sm sm:text-sm md:text-[13px] mt-1 font-semibold">
                    {finalFilteredLibraries.length !== visibleLibraries.length
                      ? `${finalFilteredLibraries.length} of ${visibleLibraries.length} interactions`
                      : `${totalLibrariesCount} interaction${totalLibrariesCount !== 1 ? 's' : ''}`
                    }
                    {searchQuery && ` for "${searchQuery}"`}
                  </div>
                </div>

                {board.share_url && (
                  <button
                    onClick={copyShareLink}
                    className={`inline-flex items-center px-3 sm:px-3 md:px-2.5 py-2 border text-xs sm:text-sm md:text-[13px] font-medium rounded-md focus:outline-none focus:ring-0 w-full sm:w-auto ${
                      userPlanLimits?.canShare
                        ? 'border-[#CECCFF] text-[#2B235A] bg-[#F5F5FA] opacity-85 hover:opacity-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        : 'border-[#9943EE] text-[#2B235A] bg-[#EEE4FF] hover:opacity-90 transition-opacity duration-500'
                    }`}
                  >
                    {userPlanLimits?.canShare ? (
                      linkCopied ? (
                        <>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                          <span className="hidden sm:inline">Link Copied</span>
                          <span className="sm:hidden">Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                          <span className="hidden sm:inline">Copy Share Link</span>
                          <span className="sm:hidden">Share</span>
                        </>
                      )
                    ) : (
                      <>
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-1 sm:mr-2" />
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-1 sm:mr-2 text-[#9943EE] fill-current" />
                        <span className="hidden sm:inline">Upgrade to Share</span>
                        <span className="sm:hidden">Upgrade</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Show upgrade banner for free users with blurred libraries */}
        {userPlanLimits?.isFree && blurredLibraries.length > 0 && (
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 mb-4 sm:mb-6 md:mb-5 font-sora">
            <div className="p-3 sm:p-4 md:py-3.5 md:px-6 mx-2 sm:mx-4 md:mx-3 bg-[#EEE4FF] border border-[#CDA0FA1A] shadow-[0px_8px_16px_0px_#E4D0FE40] rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-2.5">
                  <div>
                    <h3 className="text-base sm:text-sm md:text-[13px] font-semibold text-[#2B235A]">
                      Unlock {blurredLibraries.length} more interaction{blurredLibraries.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-[13px] text-[#817399]">
                      Upgrade to Pro to access all interactions in this collection
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpgradeClick}
                  className="holographic-link2 bg-[#784AEF] text-white px-3 sm:px-4 py-2 rounded-md !font-sora !font-medium hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                >
                  <span className='z-10'>Upgrade Plan</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
          {displayedLibraries.length > 0 || blurredLibraries.length > 0 ? (
            <>
              <div className={`grid gap-4 sm:gap-6 md:gap-5 p-3 sm:p-6 md:p-5 ${
                cardsPerRow === 2 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2' :
                cardsPerRow === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {/* Render visible libraries */}
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

                {/* Render blurred libraries for free users */}
                {blurredLibraries.map((library) => (
                  <div key={library.id} className="relative font-sora">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                      <div className="text-center px-3 sm:px-4">
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#9943EE] fill-current mx-auto mb-2" />
                        <p className="text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] mb-2">Pro Feature</p>
                        <button
                          onClick={handleUpgradeClick}
                          className="px-3 sm:px-3 py-2 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white text-[10px] sm:text-xs md:text-[11px] font-medium rounded hover:opacity-90 focus:outline-none focus:ring-0 transition-opacity duration-500"
                        >
                          <span className='z-10'>Upgrade Plan</span>
                        </button>
                      </div>
                    </div>
                    <LibraryCard
                      ziggy={ziggyData}
                      library={library}
                      auth={authData}
                      cardsPerRow={cardsPerRow}
                      onStarClick={handleStarClick}
                      onClick={handleLibraryClick}
                      userLibraryIds={userLibraryIds}
                      viewedLibraryIds={viewedLibraryIds}
                      onLibraryViewed={handleLibraryViewed}
                      isBlurred={true}
                      userPlanLimits={userPlanLimits}
                    />
                  </div>
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

            <div className="text-center py-8 sm:py-12 md:py-10 font-sora px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-5">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 text-[#2B235A] dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-[22px] font-sora !font-bold text-[#2B235A] dark:text-white mb-2">
                {totalLibrariesCount === 0 ? 'No Interactions Found' : 'No interactions found'}
              </h3>
              <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 max-w-md mx-auto mb-4 sm:mb-6 md:mb-5">
                {totalLibrariesCount === 0
                  ? 'Start adding interactions to this board from the main library'
                  : searchQuery || selectedPlatform !== 'all'
                    ? 'No interactions match your current filters in this collection.'
                    : 'No interactions found in this collection.'
                }
              </p>
              {totalLibrariesCount === 0 ? (
                <Link
                  href="/"
                  className="inline-block holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                >
                  <span className='z-10'>Browse Interactions</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPlatform('all');
                    setItemsToShow(12);
                  }}
                  className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                >
                  <span className='z-10'>Clear All Filters</span>
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
          userPlanLimits={userPlanLimits}
        />

        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={handlePricingModalClose}
          isAuthenticated={!!authData.user}
        />

      </Layout>
    </>
  );
};

export default BoardDetail;
