import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ArrowRight, ChevronRight, Home, Search } from 'lucide-react';
import Layout from './Layout';
import UniversalSearch from '@/Components/UniversalSearch';
import { useSearch } from '@/hooks/useSearch';

const animationStyles = `
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-slide-in-down { animation: slideInDown 0.6s ease-out; }
  .animate-slide-in-up { animation: slideInUp 0.5s ease-out; }
  .animate-fade-in { animation: fadeIn 0.8s ease-out; }
  .animate-scale-in { animation: scaleIn 0.4s ease-out; }
  .element-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .arrow-icon { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .element-card:hover .arrow-icon { transform: translateX(3px) scale(1.1); }
  @media (prefers-reduced-motion: reduce) {
    .animate-slide-in-down, .animate-slide-in-up, .animate-fade-in,
    .animate-scale-in, .element-card { animation: none !important; transition: none !important; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('category-animations')) {
  const style = document.createElement('style');
  style.id = 'category-animations';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

interface Industry {
  id: number;
  name: string;
  slug: string;
}

interface IndustryVariant {
  id: number;
  name: string;
  industries: Industry[];
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

interface FlatItem {
  type: 'heading' | 'industry';
  variantName?: string;
  industry?: Industry;
}

interface AllCategoriesProps extends PageProps {
  libraries: Library[];
  industryVariants: IndustryVariant[];
  industriesNotInVariants: Industry[];
  allIndustries: Industry[];
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
  filterType?: 'industry';
  filterValue?: string;
  filterName?: string;
}

const AllCategories: React.FC<AllCategoriesProps> = ({
  libraries: initialLibraries = [],
  industryVariants = [],
  industriesNotInVariants = [],
  allIndustries = [],
  filters,
  filterType,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  userPlanLimits,
  currentPlan,
  filterValue,
  filterName,
  auth
}) => {
  const { url, props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [searchQuery, setSearchQuery] = useState('');
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState<boolean>(false);
  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  const {
    searchQuery: industrySearchQuery,
    setSearchQuery: setIndustrySearchQuery,
    filteredData: filteredAllIndustries,
    isSearching: isSearchingIndustries,
  } = useSearch({
    data: allIndustries,
    searchKey: 'name'
  });

  // Filter industries based on search
  const filteredIndustriesNotInVariants = useMemo(() => {
    if (!industrySearchQuery.trim()) {
      return industriesNotInVariants;
    }
    return industriesNotInVariants.filter(industry =>
      filteredAllIndustries.some(filtered => filtered.id === industry.id)
    );
  }, [industriesNotInVariants, filteredAllIndustries, industrySearchQuery]);

  // Filter variants based on search
  const filteredVariants = useMemo(() => {
    if (!industrySearchQuery.trim()) {
      return industryVariants;
    }

    return industryVariants
      .map(variant => ({
        ...variant,
        industries: variant.industries.filter(industry =>
          filteredAllIndustries.some(filtered => filtered.id === industry.id)
        )
      }))
      .filter(variant => variant.industries.length > 0);
  }, [industryVariants, filteredAllIndustries, industrySearchQuery]);

  // Flatten all items (headings + industries) and distribute into 4 columns
  const distributeIntoColumns = useMemo(() => {
    const allItems: FlatItem[] = [];

    // Add all variants with their industries
    filteredVariants.forEach(variant => {
      allItems.push({ type: 'heading', variantName: variant.name });
      variant.industries.forEach(industry => {
        allItems.push({ type: 'industry', industry });
      });
    });

    // Add "All Categories" section
    if (filteredIndustriesNotInVariants.length > 0) {
      allItems.push({ type: 'heading', variantName: 'All Categories' });
      filteredIndustriesNotInVariants.forEach(industry => {
        allItems.push({ type: 'industry', industry });
      });
    }

    // Distribute items evenly across 4 columns
    const columns: FlatItem[][] = [[], [], [], []];
    const itemsPerColumn = Math.ceil(allItems.length / 4);

    let currentColumn = 0;
    allItems.forEach((item, index) => {
      columns[currentColumn].push(item);

      // Move to next column after reaching itemsPerColumn (except for last column)
      if ((index + 1) % itemsPerColumn === 0 && currentColumn < 3) {
        currentColumn++;
      }
    });

    return columns;
  }, [filteredVariants, filteredIndustriesNotInVariants]);

  const totalIndustriesCount = allIndustries.length;

  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderIndustryLink = (industry: Industry, index: number) => (
    <Link
      key={industry.id}
      href={`/browse?industry=${industry.slug}`}
      className={`flex items-center outline-none focus:outline-none transition-all duration-200 group element-card py-1 ${
        filterValue === industry.slug
          ? 'border-[#E3E2FF] bg-[#FAFAFC] dark:bg-blue-900/20'
          : 'border-[#E3E2FF] dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 transition-colors duration-500'
      }`}
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 mr-2 sm:mr-3 md:mr-2.5 flex items-center justify-center text-lg text-[#D3D3DF] group-hover:text-[#2B235A] flex-shrink-0 transition-all duration-500">
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-10 md:h-5 arrow-icon" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm sm:text-base md:text-[15px] font-medium text-[#2B235A] dark:text-white group-hover:text-[#2B235A] dark:group-hover:text-white">
          {industry.name}
        </span>
      </div>
    </Link>
  );

  return (
    <>
      <Head title={filterName ? `${filterName} - All Categories` : 'All Categories'} />
      <Layout
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
      >
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
              <h1 className="text-xl sm:text-[26px] md:text-2xl font-semibold text-gray-900 focus:outline-none outline-none dark:text-white animate-slide-in-down">
                {totalIndustriesCount} + {filterName ? `${filterName} Categories` : 'Categories'}
              </h1>

              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <UniversalSearch
                  className='md:mr-8'
                  data={allIndustries}
                  searchQuery={industrySearchQuery}
                  onSearchChange={setIndustrySearchQuery}
                  searchKey="name"
                  placeholder="Search Industries..."
                  showResultsCount={true}
                  searchLabel="categories"
                  noResultsText="No Industries found"
                />
              </div>
            </div>

            {/* No Results State */}
            {filteredVariants.length === 0 && filteredIndustriesNotInVariants.length === 0 && isSearchingIndustries ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-10 text-center px-4 animate-scale-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-3.5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#2B235A] dark:text-gray-500 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg md:text-[17px] font-medium text-[#2B235A] dark:text-white mb-2 animate-slide-in-up">
                  No Industries found
                </h3>
                <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                  Try searching with different keywords
                </p>
                <button
                  onClick={() => setIndustrySearchQuery('')}
                  className="text-white opacity-95 bg-[#2B235A] px-3 sm:px-4 md:px-3.5 py-2 rounded-md hover:opacity-100 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm sm:text-base md:text-[15px] transition-all duration-300 active:scale-95 animate-slide-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-3.5 mb-8 sm:mb-12 md:mb-10 font-sora">
                {/* Render each column */}
                {distributeIntoColumns.map((column, columnIndex) => (
                  <div
                    key={columnIndex}
                    className={`space-y-0 ${columnIndex === 1 ? 'hidden sm:block' : ''} ${columnIndex === 2 ? 'hidden lg:block' : ''} ${columnIndex === 3 ? 'hidden xl:block' : ''}`}
                  >
                    {column.map((item, itemIndex) => (
                      <div key={`${columnIndex}-${itemIndex}`}>
                        {item.type === 'heading' ? (
                          <h4
                                className={`text-base sm:text-lg md:text-xl font-semibold text-[#2B235A] dark:text-white mb-4
                                ${itemIndex === 0 ? '' : 'pt-5'}`}
                            >
                            {item.variantName}
                          </h4>
                        ) : (
                          item.industry && renderIndustryLink(item.industry, itemIndex)
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {isLoadingLibraries && filterValue && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Loading {filterName} libraries...
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AllCategories;
