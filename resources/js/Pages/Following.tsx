import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Layout from './Layout';
import LibraryModal from './LibraryModal';
import LibraryGrid from './LibraryGrid';
import { Home, ChevronRight, BookmarkCheck, Star, User } from 'lucide-react';
import EmptyState from '../Components/EmptyState';
import FilterSection2 from './Website/Components/FilterSection2';

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

interface FollowedCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  libraries: Library[];
}

interface FollowingProps extends PageProps {
  libraries: Library[];
  selectedLibrary?: Library | null;
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
  followedCategories: FollowedCategory[];
  initialLoad?: boolean;
}

// Skeleton loader for categories
const CategorySkeleton: React.FC = () => (
  <div className="bg-[#F8F8F9] dark:bg-gray-900 rounded-lg overflow-hidden animate-pulse">
    <div className="pt-4 sm:pt-6 md:pt-5 pb-2 sm:pb-3 md:pb-2.5 px-4 sm:px-6 md:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-7.5 md:h-7.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-9 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
    <div className="px-4 sm:px-6 md:px-5 pb-4 sm:pb-6 md:pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

const Following: React.FC<FollowingProps> = ({
  libraries: initialLibraries,
  selectedLibrary: initialSelectedLibrary = null,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  filters,
  followedCategories: initialFollowedCategories,
  userPlanLimits,
  currentPlan,
  auth,
  initialLoad = false,
}) => {
  const { url, props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [followedCategories, setFollowedCategories] = useState<FollowedCategory[]>(initialFollowedCategories || []);
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries || []);
  const [displayedCategories, setDisplayedCategories] = useState<FollowedCategory[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isLoadingCategories, setIsLoadingCategories] = useState(initialLoad);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(false);

  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [cardsPerRow, setCardsPerRow] = useState(3);

  // Modal state
  const [modalLibrary, setModalLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);

  // Refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch followed categories on mount
  useEffect(() => {
    if (authData?.user && initialLoad) {
      fetchFollowedCategories(selectedPlatform);
    }
  }, [authData?.user, initialLoad]);

  // Listen for custom events from CategoryHeader follow/unfollow
  useEffect(() => {
    const handleCategoryFollowChange = (event: CustomEvent) => {
      console.log('Category follow change detected:', event.detail);
      // Refresh followed categories
      fetchFollowedCategories(selectedPlatform);
    };

    window.addEventListener('category-follow-changed' as any, handleCategoryFollowChange);

    return () => {
      window.removeEventListener('category-follow-changed' as any, handleCategoryFollowChange);
    };
  }, [selectedPlatform]);

  // Listen for page focus to refresh data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authData?.user) {
        // Page became visible, refresh data
        fetchFollowedCategories(selectedPlatform);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedPlatform, authData?.user]);

  // Lazy load libraries for layout search (only when needed)
  const fetchLibrariesForLayout = useCallback(async () => {
    if (libraries.length > 0 || isLoadingLibraries) return;

    setIsLoadingLibraries(true);
    try {
      const response = await fetch('/api/following/libraries');
      if (response.ok) {
        const data = await response.json();
        setLibraries(data.libraries || []);
      }
    } catch (error) {
      console.error('Error fetching libraries:', error);
    } finally {
      setIsLoadingLibraries(false);
    }
  }, [libraries.length, isLoadingLibraries]);

  // Fetch followed categories with platform filter
  const fetchFollowedCategories = async (platform: string = 'all') => {
    if (!authData?.user) {
      setIsLoadingCategories(false);
      return;
    }

    setIsLoadingCategories(true);

    try {
      const response = await fetch(`/api/following/categories?platform=${platform}`);
      if (response.ok) {
        const data = await response.json();
        setFollowedCategories(data.followedCategories || []);
      }
    } catch (error) {
      console.error('Error fetching followed categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Update effects
  useEffect(() => {
    setViewedLibraryIds(initialViewedLibraryIds);
  }, [initialViewedLibraryIds]);

  useEffect(() => {
    setUserLibraryIds(initialUserLibraryIds);
  }, [initialUserLibraryIds]);

  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
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
  }, [window.location.pathname]);

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
      window.history.replaceState({}, '', '/following');
      setIsModalOpen(false);
      setModalLibrary(null);
    }
  };

  // Get all libraries from followed categories
  const allFollowedLibraries = useMemo(() => {
    return followedCategories.flatMap(category => category.libraries);
  }, [followedCategories]);

  // Debounced search filter
  const searchFilteredCategories = useMemo(() => {
    let filteredCategories = followedCategories;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredCategories = filteredCategories.map(category => ({
        ...category,
        libraries: category.libraries.filter(library =>
          library.title.toLowerCase().includes(query) ||
          library.description?.toLowerCase().includes(query) ||
          library.platforms.some(platform => platform.name.toLowerCase().includes(query)) ||
          library.categories.some(cat => cat.name.toLowerCase().includes(query)) ||
          library.industries.some(industry => industry.name.toLowerCase().includes(query)) ||
          library.interactions.some(interaction => interaction.name.toLowerCase().includes(query))
        )
      })).filter(category => category.libraries.length > 0);
    }

    return filteredCategories;
  }, [followedCategories, searchQuery]);

  // Apply platform filter (already filtered from backend)
  const finalFilteredCategories = useMemo(() => {
    return searchFilteredCategories;
  }, [searchFilteredCategories]);

  // Update displayed categories
  useEffect(() => {
    setDisplayedCategories(finalFilteredCategories.slice(0, itemsToShow));
  }, [finalFilteredCategories, itemsToShow]);

  // Handlers
  const handleSearch = (query: string) => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
      setItemsToShow(12);
    }, 300);
  };

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 12);
  };

  const handlePlatformChange = (platform: string) => {
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    setSelectedPlatform(platform);
    setItemsToShow(12);

    // Debounce API call
    filterTimeoutRef.current = setTimeout(() => {
      fetchFollowedCategories(platform);
    }, 100);
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

  const hasMore = displayedCategories.length < finalFilteredCategories.length;

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
      if (refreshIntervalRef.current) clearTimeout(refreshIntervalRef.current);
    };
  }, []);

  // If user is not authenticated, show empty state
  if (!authData?.user) {
    return (
      <>
        <Head title="Following" />
        <Layout
          libraries={libraries}
          currentRoute={url}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          filters={filters}
          auth={authData}
          ziggy={ziggyData}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
          userPlanLimits={userPlanLimits}
          currentPlan={currentPlan}
        >
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6">
            <div className="mb-4 sm:mb-6 md:mb-5">
              <div className="flex items-center text-[#BABABA] dark:text-gray-400 text-sm">
                <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none">
                  <Home className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
                </Link>
                <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
              </div>
              <h1 className="text-xl sm:text-[26px] md:text-2xl font-sora !font-semibold mt-2">Following</h1>
            </div>

            <div className="flex justify-center">
              <EmptyState
                icon={Star}
                heading="Follow Apps to stay updated"
                description="Follow your favorite Brand App to discover new interactions and stay updated with the latest designs. Sign in to get started and build your personalized feed."
                buttonText="Login to follow Apps"
                buttonRoute="/login"
              />
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head title="Following" />
      <Layout
        libraries={libraries}
        currentRoute={url}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6">
          {/* Breadcrumb & Heading */}
          <div className="mb-6 sm:mb-8 md:mb-7">
            <div className="flex items-center text-[#BABABA] dark:text-gray-400 text-sm mb-3 sm:mb-4 md:mb-3.5">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none">
                <Home className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mx-1 sm:mx-2" />
            </div>
            <h1 className="text-xl sm:text-[26px] md:text-2xl font-sora !font-semibold">Following</h1>
          </div>

          {/* Content */}
          {isLoadingCategories ? (
            <>
              {/* Filter Section Skeleton */}
              <div className="max-w-full mx-auto sticky top-[60px] md:top-[70px] lg:top-[75px] z-10 mb-6">
                <div className="bg-[#F8F8F9] dark:bg-gray-900 px-4 sm:px-6 py-4 rounded-lg animate-pulse">
                  <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Categories Skeleton */}
              <div className="space-y-6 sm:space-y-8 md:space-y-7">
                {[1, 2, 3].map((i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            </>
          ) : followedCategories.length === 0 ? (
            <div className="flex justify-center py-8 sm:py-12 md:py-10">
              <EmptyState
                icon={Star}
                heading="Start following your favorite apps & websites"
                description="Start following Brand App to see their latest interactions here. Browse All Apps and click your favourite Brand and finally follow to build your personalized feed."
                buttonText="Browse All Apps"
                buttonRoute="/all-apps"
              />
            </div>
          ) : (
            <>
              {/* Filter Section */}
              <div className="max-w-full mx-auto sticky top-[60px] md:top-[70px] lg:top-[75px] z-10">
                <FilterSection2
                  filters={filters || { platforms: [], categories: [], industries: [], interactions: [] }}
                  selectedPlatform={selectedPlatform}
                  onPlatformChange={handlePlatformChange}
                  cardsPerRow={cardsPerRow}
                  onCardsPerRowChange={handleCardsPerRowChange}
                />
              </div>

              {/* Categories Section */}
              <div className="space-y-6 sm:space-y-8 md:space-y-7 mb-12 sm:mb-20 md:mb-16 font-sora">
                {displayedCategories.length > 0 ? (
                  <>
                    {displayedCategories.map((category) => (
                      <div key={category.id} className="bg-[#F8F8F9] dark:bg-gray-900 rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <div className="pt-4 sm:pt-6 md:pt-5 pb-2 sm:pb-3 md:pb-2.5 px-4 sm:px-6 md:px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-7.5 md:h-7.5 rounded-full overflow-hidden font-sora !font-medium bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 sm:w-6 sm:h-6 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                                )}
                              </div>
                              <div>
                                <h2 className="text-base sm:text-xl md:text-lg font-semibold text-[#2B235A] dark:text-white">
                                  {category.name}
                                </h2>
                              </div>
                            </div>

                            <Link
                              href={`/browse?category=${category.slug}`}
                              className="text-[#2B235A] bg-[#F5F5FA] dark:text-white rounded-lg border border-[#CECCFF] focus:outline-none focus:ring-0 px-2.5 sm:px-3 md:px-2.5 py-1.5 sm:py-2 text-sm sm:text-base md:text-[15px] font-medium whitespace-nowrap"
                            >
                              View All
                            </Link>
                          </div>
                        </div>

                        {/* Libraries Grid */}
                        {category.libraries.length > 0 ? (
                          <div className="px-4 sm:px-6 md:px-5 pb-4 sm:pb-6 md:pb-5">
                            <LibraryGrid
                              libraries={category.libraries}
                              onLibraryClick={handleLibraryClick}
                              cardsPerRow={cardsPerRow}
                              auth={authData}
                              onStarClick={handleStarClick}
                              userLibraryIds={userLibraryIds}
                              viewedLibraryIds={viewedLibraryIds}
                              onLibraryViewed={handleLibraryViewed}
                              hasMore={false}
                              isLoading={false}
                              ziggy={ziggyData}
                              userPlanLimits={userPlanLimits}
                            />
                          </div>
                        ) : (
                          <div className="p-8 sm:p-12 md:p-10 text-center">
                            <p className="text-sm sm:text-base md:text-[15px] text-[#2B235A] dark:text-gray-400">
                              No interactions found for this App yet.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="flex justify-center mt-8 sm:mt-12 md:mt-10">
                        <button
                          onClick={handleLoadMore}
                          className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                        >
                          <span className='z-10'>Load More</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty State for filtered results */
                  <div className="text-center py-8 sm:py-12 md:py-10 px-4">
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
                        ? 'No interactions match your current filters in your followed categories.'
                        : 'No interactions found in your followed categories.'
                      }
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedPlatform('all');
                        setItemsToShow(12);
                        fetchFollowedCategories('all');
                      }}
                      className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-4 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-sm sm:text-[16px] md:text-[15px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                    >
                      <span className='z-10'>Clear All Filters</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Library Modal */}
        <LibraryModal
          library={modalLibrary}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onClick={handleLibraryClick}
          allLibraries={allFollowedLibraries}
          onNavigate={handleModalNavigation}
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
    </>
  );
};

export default Following;
