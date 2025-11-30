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

if (typeof document !== 'undefined' && !document.getElementById('element-animations')) {
  const style = document.createElement('style');
  style.id = 'element-animations';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

interface Interaction {
  id: number;
  name: string;
  slug: string;
}

interface InteractionVariant {
  id: number;
  name: string;
  interactions: Interaction[];
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
  type: 'heading' | 'interaction';
  variantName?: string;
  interaction?: Interaction;
}

interface AllElementsProps extends PageProps {
  libraries: Library[];
  interactionVariants: InteractionVariant[];
  interactionsNotInVariants: Interaction[];
  allInteractions: Interaction[];
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
  filterType?: 'interaction';
  filterValue?: string;
  filterName?: string;
}

const AllElements: React.FC<AllElementsProps> = ({
  libraries: initialLibraries = [],
  interactionVariants = [],
  interactionsNotInVariants = [],
  allInteractions = [],
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
    searchQuery: interactionSearchQuery,
    setSearchQuery: setInteractionSearchQuery,
    filteredData: filteredAllInteractions,
    isSearching: isSearchingInteractions,
  } = useSearch({
    data: allInteractions,
    searchKey: 'name'
  });

  // Filter interactions based on search
  const filteredInteractionsNotInVariants = useMemo(() => {
    if (!interactionSearchQuery.trim()) {
      return interactionsNotInVariants;
    }
    return interactionsNotInVariants.filter(interaction =>
      filteredAllInteractions.some(filtered => filtered.id === interaction.id)
    );
  }, [interactionsNotInVariants, filteredAllInteractions, interactionSearchQuery]);

  // Filter variants based on search
  const filteredVariants = useMemo(() => {
    if (!interactionSearchQuery.trim()) {
      return interactionVariants;
    }

    return interactionVariants
      .map(variant => ({
        ...variant,
        interactions: variant.interactions.filter(interaction =>
          filteredAllInteractions.some(filtered => filtered.id === interaction.id)
        )
      }))
      .filter(variant => variant.interactions.length > 0);
  }, [interactionVariants, filteredAllInteractions, interactionSearchQuery]);

  // Flatten all items (headings + interactions) and distribute into 4 columns
  const distributeIntoColumns = useMemo(() => {
    const allItems: FlatItem[] = [];

    // Add all variants with their interactions
    filteredVariants.forEach(variant => {
      allItems.push({ type: 'heading', variantName: variant.name });
      variant.interactions.forEach(interaction => {
        allItems.push({ type: 'interaction', interaction });
      });
    });

    // Add "All Elements" section
    if (filteredInteractionsNotInVariants.length > 0) {
      allItems.push({ type: 'heading', variantName: 'Other Elements' });
      filteredInteractionsNotInVariants.forEach(interaction => {
        allItems.push({ type: 'interaction', interaction });
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
  }, [filteredVariants, filteredInteractionsNotInVariants]);

  const totalInteractionsCount = allInteractions.length;

  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderInteractionLink = (interaction: Interaction, index: number) => (
    <Link
      key={interaction.id}
      href={`/browse?interaction=${interaction.slug}`}
      className={`flex items-center outline-none focus:outline-none transition-all duration-200 group element-card py-1 ${
        filterValue === interaction.slug
          ? 'border-[#E3E2FF] bg-[#FAFAFC] dark:bg-blue-900/20'
          : 'border-[#E3E2FF] dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 transition-colors duration-500'
      }`}
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 mr-2 sm:mr-3 md:mr-2.5 flex items-center justify-center text-lg text-[#D3D3DF] group-hover:text-[#2B235A] flex-shrink-0 transition-all duration-500">
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-10 md:h-5 arrow-icon" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm sm:text-base md:text-[15px] font-medium text-[#2B235A] dark:text-white group-hover:text-[#2B235A] dark:group-hover:text-white">
          {interaction.name}
        </span>
      </div>
    </Link>
  );

  return (
    <>
      <Head title={filterName ? `${filterName} - All Elements` : 'All Elements'} />
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
                {totalInteractionsCount} + {filterName ? `${filterName} Elements` : 'Elements'}
              </h1>

              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <UniversalSearch
                  className='md:mr-8'
                  data={allInteractions}
                  searchQuery={interactionSearchQuery}
                  onSearchChange={setInteractionSearchQuery}
                  searchKey="name"
                  placeholder="Search Elements..."
                  showResultsCount={true}
                  searchLabel="elements"
                  noResultsText="No Elements found"
                />
              </div>
            </div>

            {/* No Results State */}
            {filteredVariants.length === 0 && filteredInteractionsNotInVariants.length === 0 && isSearchingInteractions ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-10 text-center px-4 animate-scale-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 bg-[#F5F5FA] border border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-3.5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#2B235A] dark:text-gray-500 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg md:text-[17px] font-medium text-[#2B235A] dark:text-white mb-2 animate-slide-in-up">
                  No elements found
                </h3>
                <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                  Try searching with different keywords
                </p>
                <button
                  onClick={() => setInteractionSearchQuery('')}
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
                    className="space-y-0"
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
                          item.interaction && renderInteractionLink(item.interaction, itemIndex)
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

export default AllElements;

// here this is my home page currently everything is alright. just have to make something which is for unauthenticated users.  for authenticated users everything will be as it is what it is right now.  the features are:

// in after hero section there will be a section name which is Top Apps. there will show total 3 cards of top apps (topLibrariesByCategory) and then top element 3 card (topLibrariesByInteraction) and in last top industries (topLibrariesByIndustry). and the card design will be like the board card but in top there will be the name of category names like thisand from the outside exactly same look boardcard libraries video should be stacked in same way but edit create these should not have there just take the card design. and in each section there will be show all button and there route will be for all apps '/all-apps' , for element '/all-elements' and for industries '/all-categories'. in click of each card there will be redirect to these with corresponding.

// /browse?category=${category.slug} for apps

// /browse?industry=${industry.slug} for industry

// /browse?interaction=${interaction.slug} for element

// just create this 3 section for unauthenticated users.
