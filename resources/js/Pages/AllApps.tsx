import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Layout from './Layout';
import UniversalSearch from '@/Components/UniversalSearch';
import { useSearch } from '@/hooks/useSearch';
import { ChevronRight, Home, Search, ArrowRight } from 'lucide-react';

// Add CSS for animations
const animationStyles = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-slide-in-down {
    animation: slideInDown 0.6s ease-out;
  }

  .animate-slide-in-up {
    animation: slideInUp 0.5s ease-out;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out;
  }

  .app-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(43, 35, 90, 0.06);
  }

  .app-card:hover .app-image {
    transform: scale(1.02);
  }

  .app-image {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-slide-in-down,
    .animate-slide-in-up,
    .animate-fade-in,
    .animate-scale-in,
    .app-card {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
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

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface AllAppsProps extends PageProps {
  libraries: Library[];
  categories: Category[];
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  userPlanLimits?: UserPlanLimits | null;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  filterType?: 'category';
  filterValue?: string;
  filterName?: string;
}

const AllApps: React.FC<AllAppsProps> = ({
  libraries,
  categories,
  filters,
  filterType,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  userPlanLimits,
  filterValue,
  filterName,
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [searchQuery, setSearchQuery] = useState('');
  const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);


    // ADD THIS: State for userLibraryIds
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

  // Use the custom search hook for categories
  const {
    searchQuery: categorySearchQuery,
    setSearchQuery: setCategorySearchQuery,
    filteredData: filteredCategories,
    isSearching: isSearchingCategories,
    resultsCount: categoryResultsCount,
    totalCount: categoryTotalCount
  } = useSearch({
    data: categories,
    searchKey: 'name' // Search by category name
  });

  // Filter libraries based on search
  const filteredLibraries = useMemo(() => {
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

  // Update displayed libraries when filteredLibraries or itemsToShow changes
  useEffect(() => {
    setDisplayedLibraries(filteredLibraries.slice(0, itemsToShow));
  }, [filteredLibraries, itemsToShow]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setItemsToShow(12);
  };

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 12);
  };

  const handleLibraryClick = (library: Library) => {
    window.open(library.url, '_blank');
  };

  const handleStarClick = (library: Library, isStarred: boolean) => {
    console.log('Star clicked:', library.title, isStarred);
  };

  const hasMore = displayedLibraries.length < filteredLibraries.length;

  return (
    <>
      <Head title={filterName ? `${filterName} - All Apps` : 'All Apps'} />
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
        {/* Header Section */}
        <div className="bg-[#F8F8F9] dark:bg-gray-900 font-sora overflow-hidden">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 sm:space-x-2 text-sm text-[#BABABA] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5 animate-slide-in-down">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors duration-500 ease-in-out hover:scale-110">
                <Home className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 transition-transform duration-300'/>
              </Link>
              <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
              <span className="text-sm sm:text-base md:text-[15px] text-[#BABABA] dark:text-white font-medium">
                Browse All Listed
              </span>
            </nav>

            {/* Header with search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 md:mb-7 gap-3 sm:gap-4 md:gap-3">
              <h3 className="text-xl sm:text-[26px] md:text-2xl font-semibold text-gray-900 focus:outline-none outline-none dark:text-white animate-slide-in-down">
                {categories.length} + {filterName ? `${filterName} Apps` : 'Products'}
              </h3>

              {/* Universal Search Component */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <UniversalSearch
                  className='mr-0 sm:mr-10 md:mr-8'
                  data={categories}
                  searchQuery={categorySearchQuery}
                  onSearchChange={setCategorySearchQuery}
                  searchKey="name"
                  placeholder="Search Apps..."
                  showResultsCount={true}
                  searchLabel="categories"
                  noResultsText="No categories found"
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 sm:gap-4 md:gap-3.5 mb-8 sm:mb-12 md:mb-10 font-sora">
              {filteredCategories.length === 0 && isSearchingCategories ? (
                <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-10 text-center px-4 animate-scale-in">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-3.5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#2B235A] dark:text-gray-500 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-[17px] font-medium text-[#2B235A] dark:text-white mb-2 animate-slide-in-up">
                    No categories found
                  </h3>
                  <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    className="text-white opacity-95 bg-[#2B235A] px-3 sm:px-4 md:px-3.5 py-2 rounded-md hover:opacity-100 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm sm:text-base md:text-[15px] transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-in-up"
                    style={{ animationDelay: '0.2s' }}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                /* Category Links */
                filteredCategories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className={`flex flex-col items-center p-2 sm:p-2 md:p-1.5 rounded-xl focus:!outline-none transition-all duration-200 group app-card ${
                      filterValue === category.slug
                        ? 'bg-[#E3E2FF] dark:bg-blue-900/20'
                        : 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
                    }`}
                    style={{
                      animation: `slideInUp 0.5s ease-out ${index * 0.03}s both`
                    }}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 rounded-xl object-cover mb-2 sm:mb-3 md:mb-2.5 app-image"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 bg-gradient-to-br from-[#2B235A] to-[#564638] rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-2.5 app-image transition-transform duration-300">
                        <span className="text-white text-base sm:text-xl md:text-lg font-bold">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-white text-center leading-tight">
                      {category.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AllApps;
