import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, BookmarkCheck, ChevronRight, Home, Search, Crown } from 'lucide-react';
import Layout from './Layout';
import EmptyState from '../Components/EmptyState';
import BoardModal from '../Components/BoardModal';
import BoardCard from '../Components/BoardCard';
import UniversalSearch from '@/Components/UniversalSearch';
import { useSearch } from '@/hooks/useSearch';
import { PageProps } from '@/types';
import PricingModal from './PricingModal';
import DeleteBoardModal from '../Components/DeleteBoardModal';

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

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

// interface Board {
//   id: number;
//   name: string;
//   creator_email: string;
//   share_via_link: boolean;
//   share_via_email: boolean;
//   share_url?: string | null;
//   created_at: string;
//   libraries_count: number;
//   category_images?: string[];
//   is_blurred?: boolean;
// }

interface Board {
  id: number;
  name: string;
  creator_email: string;
  visibility: 'public' | 'private'; // Add this line
  share_via_link: boolean;
  share_via_email: boolean;
  share_url?: string | null;
  share_emails?: string[];
  created_at: string;
  libraries_count?: number;
  category_images?: string[];
  is_blurred?: boolean;
//   libraries?: Array<{
//     id: number;
//     title: string;
//     video_url: string;
//   }>;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface CollectionProps extends PageProps {
  boards: Board[];
  libraries: Library[];
  userPlanLimits?: UserPlanLimits | null;
  currentPlan?: any;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const Collections: React.FC<CollectionProps> = ({
  boards: initialBoards,
  libraries,
  userPlanLimits,
  currentPlan,
  filters,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const {
    searchQuery: boardSearchQuery,
    setSearchQuery: setBoardSearchQuery,
    filteredData: filteredBoards,
    isSearching: isSearchingBoards,
    resultsCount: boardResultsCount,
    totalCount: boardTotalCount
  } = useSearch({
    data: initialBoards,
    searchKey: 'name'
  });

  const handleCreateBoard = () => {
    if (userPlanLimits?.isFree && initialBoards.length >= userPlanLimits.maxBoards) {
      setIsPricingModalOpen(true);
      return;
    }

    setEditingBoard(null);
    setIsModalOpen(true);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBoard(null);
  };

  const handleUpgradeClick = () => {
    setIsPricingModalOpen(true);
  };

  const handlePricingModalClose = () => {
    setIsPricingModalOpen(false);
  };

  const handleDeleteBoard = (board: Board) => {
  setDeletingBoard(board);
  setIsDeleteModalOpen(true);
};

const handleCloseDeleteModal = () => {
  setIsDeleteModalOpen(false);
  setDeletingBoard(null);
};

  const visibleBoards = filteredBoards.filter(board => !board.is_blurred);
  const blurredBoards = filteredBoards.filter(board => board.is_blurred);

  if (!authData?.user) {
    return (
      <>
        <Head title="Collections" />
        <Layout
          libraries={libraries}
          currentRoute={url}
          onSearch={() => {}}
          searchQuery=""
          filters={filters}
          auth={authData}
          ziggy={ziggyData}
          userPlanLimits={userPlanLimits}
          currentPlan={currentPlan}
          userLibraryIds={userLibraryIds}
          viewedLibraryIds={viewedLibraryIds}
          onLibraryViewed={handleLibraryViewed}
        >
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6 font-sora">
            <div className="mb-4 sm:mb-6 md:mb-5 font-sora">
              <div className="flex items-center text-[#BABABA] dark:text-gray-400 text-sm">
                <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none">
                  <Home className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
                </Link>
                <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
                <span className='text-sm sm:text-base md:text-[15px]'>
                  All interaction of
                </span>
              </div>
              <h1 className="text-xl sm:text-[26px] md:text-2xl !font-semibold mt-2">Collections</h1>
            </div>

            <div className="flex justify-center">
              <EmptyState
                icon={BookmarkCheck}
                heading="Save the best interactions in one place"
                description="Create collections to organize and save your favorite UI interactions. Sign in to get started and never lose track of inspiring designs."
                buttonText="Login to add interactions"
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
      <Head title="Collections" />
      <Layout
        libraries={libraries}
        currentRoute={url}
        onSearch={() => {}}
        searchQuery=""
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-4 sm:py-8 md:py-6 font-sora">
          <div className="mb-4 sm:mb-6 md:mb-5">
            <div className="flex items-center text-[#BABABA] dark:text-gray-400 text-sm">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors duration-300 ease-in-out">
                <Home className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
              </Link>
              <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5'/>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-2 gap-4 md:gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-3">
                <h1 className="text-xl sm:text-[26px] md:text-2xl font-sora !font-semibold text-gray-900 focus:outline-none outline-none dark:text-white">
                  Collections
                </h1>
                {userPlanLimits?.isFree && (
                  <div className="flex items-center gap-2 px-2 sm:px-3 md:px-2.5 py-1 bg-[#EEE4FF] border border-[#CDA0FA] rounded-full text-xs sm:text-sm md:text-[13px] w-fit">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-[#9943EE] fill-current" />
                    <span className="text-[#2B235A] font-medium">
                      {userPlanLimits.planName} Plan ({visibleBoards.length}/{userPlanLimits.maxBoards} boards)
                    </span>
                  </div>
                )}
              </div>

              {initialBoards.length > 0 && (
                <UniversalSearch
                  className='mr-10 md:mr-8'
                  data={initialBoards}
                  searchQuery={boardSearchQuery}
                  onSearchChange={setBoardSearchQuery}
                  searchKey="name"
                  placeholder="Search collections..."
                  showResultsCount={true}
                  searchLabel="collections"
                  noResultsText="No collections found"
                />
              )}
            </div>
          </div>

          {userPlanLimits?.isFree && blurredBoards.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-5 mx-6 md:mx-5 p-3 sm:p-4 md:py-3.5 md:px-6 bg-[#EEE4FF] border border-[#CDA0FA1A] shadow-[0px_8px_16px_0px_#E4D0FE40]
                 rounded-lg font-sora">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-2.5">
                <div className="flex items-start sm:items-center gap-3 md:gap-2.5">
                  {/* <Crown className="w-6 h-6 md:w-4.5 md:h-4.5 text-[#9943EE] fill-current flex-shrink-0 mt-0.5 sm:mt-0" /> */}
                  <div>
                    <h3 className="text-base md:text-[13px] font-semibold text-[#2B235A]">
                      Upgrade to access all your collections
                    </h3>
                    <p className="text-xs sm:text-sm md:text-[13px] text-[#817399]">
                      You have {blurredBoards.length} more collection{blurredBoards.length !== 1 ? 's' : ''} available with a Pro plan
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpgradeClick}
                  className="holographic-link2 px-4 md:px-3.5 py-2 bg-[#784AEF] text-white text-sm md:text-[13px] font-medium rounded-md hover:opacity-95 transition-opacity duration-500 ease-in-out focus:outline-none focus:ring-0 w-full sm:w-auto"
                >
                    <span className='z-10'>
                        Upgrade Plan
                    </span>
                </button>
              </div>
            </div>
          )}

          {initialBoards.length > 0 ? (
            <>
              {filteredBoards.length === 0 && isSearchingBoards ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-10 text-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 bg-[#F5F5FA] border-[1px] border-[#CECCFF] dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-3.5">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#2B235A] dark:text-gray-500" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-[17px] font-medium text-[#2B235A] dark:text-white mb-2">
                    No collections found
                  </h3>
                  <p className="text-sm sm:text-base md:text-[15px] text-gray-500 dark:text-gray-400 mb-4 md:mb-3.5">
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={() => setBoardSearchQuery('')}
                    className="text-white opacity-95 bg-[#2B235A] px-4 md:px-3.5 py-2 rounded-md hover:opacity-100 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm sm:text-base md:text-[15px]"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-5 mt-6 sm:mt-10 md:mt-8 focus:outline-none focus:ring-0 px-0 sm:px-6 md:px-5">
                  {visibleBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onEdit={handleEditBoard}
                      onDelete={handleDeleteBoard}
                      userPlanLimits={userPlanLimits}
                    />
                  ))}

                  {!userPlanLimits?.isFree || visibleBoards.length < userPlanLimits.maxBoards ? (
                    <button
                      onClick={handleCreateBoard}
                      className="inline-flex items-center justify-center w-full min-h-[250px] sm:min-w-[400px] sm:min-h-[300px] md:min-w-[350px] md:min-h-[280px] px-4 py-2 rounded-lg border border-[#E3E2FF] text-base sm:text-[18px] md:text-[17px] font-semibold text-[#2B235A] opacity-85 bg-[#F5F5FA] hover:opacity-100 focus:outline-none transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Board
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgradeClick}
                      className="inline-flex flex-col items-center justify-center w-full min-h-[250px] sm:min-w-[400px] sm:min-h-[300px] md:min-w-[350px] md:min-h-[280px] px-4 py-2 border-2 border-dashed border-[#9943EE] text-base sm:text-[18px] md:text-[17px] font-semibold text-[#443B82] bg-[#EEE4FF] hover:opacity-90
                      rounded-md focus:outline-none transition-opacity duration-300"
                    >
                      <Crown className="w-6 h-6 md:w-5 md:h-5 mb-2 text-[#9943EE] fill-current" />
                      <span>Upgrade to Create More</span>
                      <span className="text-xs sm:text-sm md:text-[13px] text-[#817399] font-normal">({visibleBoards.length}/{userPlanLimits.maxBoards} boards used)</span>
                    </button>
                  )}

                  {blurredBoards.map((board) => (
                    <div key={board.id} className="relative font-sora">
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                        <div className="text-center px-4">
                          <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-[#9943EE] fill-current mx-auto mb-2" />
                          <p className="text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] mb-2">Pro Feature</p>
                          <button
                            onClick={handleUpgradeClick}
                            className="px-3 py-2 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white text-xs md:text-[11px] font-medium rounded hover:opacity-90 transition-opacity duration-500 focus:outline-none focus:ring-0"
                          >
                            <span className='z-10'>
                            Upgrade Plan
                            </span>
                          </button>
                        </div>
                      </div>
                      <BoardCard
                        board={board}
                        onEdit={handleEditBoard}
                        userPlanLimits={userPlanLimits}
                        onDelete={handleDeleteBoard}
                        isBlurred={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh] sm:min-h-screen sm:pb-96 md:min-h-[70vh] md:pb-72 px-4">
              <div className="text-center">
                <div className="mb-6 sm:mb-10 md:mb-8">
                  <BookmarkCheck className="w-16 h-16 sm:w-20 sm:h-20 md:w-18 md:h-18 text-[#62626C] mx-auto" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-[28px] font-medium text-[#0A081B] mb-2">
                  No boards yet
                </h3>
                <p className="text-sm sm:text-base md:text-[15px] text-[#7F7F8A] mb-6 sm:mb-8 md:mb-7">
                  Create your first board to start organizing interactions
                </p>
                <button
                  onClick={handleCreateBoard}
                  className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-3 md:px-3.5 py-2 rounded-[4px] !font-sora !font-medium text-base sm:text-lg md:text-[17px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
                >
                    <span className='z-10'>
                        Create Your First Board
                    </span>
                </button>
              </div>
            </div>
          )}

          <BoardModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            board={editingBoard}
            userEmail={authData.user.email}
            userPlanLimits={userPlanLimits}
          />

          <DeleteBoardModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            board={deletingBoard}
          />

          <PricingModal
            isOpen={isPricingModalOpen}
            onClose={handlePricingModalClose}
            isAuthenticated={!!authData.user}
          />
        </div>
      </Layout>
    </>
  );
};

export default Collections;
