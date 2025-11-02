import React, { useState, useEffect, useCallback, memo } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import { Infinity } from 'lucide-react';

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
}

interface LibraryGridProps extends PageProps {
  libraries: Library[];
  onLibraryClick: (library: Library) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  cardsPerRow?: number;
  userPlanLimits?: UserPlanLimits | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
  onStarClick?: (library: Library, isStarred: boolean) => void;
  isAuthenticated?: boolean;
}

// Memoized library card for better performance
const MemoizedLibraryCard = memo<{
  library: Library;
  onLibraryClick: (library: Library) => void;
  cardSize: 'normal' | 'large';
  auth: any;
  ziggy: any;
  onStarClick?: (library: Library, isStarred: boolean) => void;
  userPlanLimits?: UserPlanLimits | null;
  userLibraryIds: number[];
  viewedLibraryIds?: number[];
  onLibraryViewed?: (libraryId: number) => void;
  isBlurred?: boolean;
}>(({ library, onLibraryClick, cardSize, auth, ziggy, onStarClick, userLibraryIds, viewedLibraryIds, onLibraryViewed, userPlanLimits, isBlurred = false }) => {
  return (
    <div className={isBlurred ? 'blur-xl pointer-events-none' : ''}>
      <LibraryCard
        ziggy={ziggy}
        library={library}
        onClick={isBlurred ? () => {} : onLibraryClick}
        cardSize={cardSize}
        auth={auth}
        onStarClick={isBlurred ? () => {} : onStarClick}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={onLibraryViewed}
        userPlanLimits={userPlanLimits}
      />
    </div>
  );
});

MemoizedLibraryCard.displayName = 'MemoizedLibraryCard';

const LibraryGrid: React.FC<LibraryGridProps> = ({
  libraries,
  onLibraryClick,
  onLoadMore,
  hasMore = true,
  isLoadingMore = false,
  cardsPerRow = 3,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onLibraryViewed,
  auth,
  userPlanLimits,
  onStarClick,
  isAuthenticated,
}) => {
  const { props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isUserAuthenticated = isAuthenticated ?? !!authData?.user;

  const [isNearBottom, setIsNearBottom] = useState(false);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if user is near bottom (within 800px)
    const isNear = scrollTop + windowHeight >= documentHeight - 800;
    setIsNearBottom(isNear);

    // Trigger load more if near bottom, has more content, not already loading, and user is authenticated
    if (isNear && hasMore && !isLoadingMore && onLoadMore && isUserAuthenticated) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore, isUserAuthenticated]);

  // Throttled scroll event listener
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 150); // Throttle to every 150ms
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Dynamic grid columns based on cardsPerRow prop
  const getGridCols = () => {
    switch (cardsPerRow) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 lg:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Dynamic gap based on cardsPerRow for better spacing
  const getGridGap = () => {
    return cardsPerRow === 2 ? 'gap-8' : 'gap-6';
  };

  // Check if libraries is null, undefined, or not an array
  if (!libraries) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#564638] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading libraries...
          </p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(libraries)) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error: Libraries data is not in expected format
          </p>
        </div>
      </div>
    );
  }

  if (libraries.length === 0) {
    return (
      <div className="p-6">
        {/* Empty state commented out */}
      </div>
    );
  }

  // For unauthenticated users, split the libraries: first 12 normal + rest blurred
  const normalLibraries = isUserAuthenticated ? libraries : libraries.slice(0, 12);
  const blurredLibraries = isUserAuthenticated ? [] : libraries.slice(12, 18); // Show only 6 blurred items

  // Calculate whether to show login prompt
  const showLoginPrompt = !isUserAuthenticated && blurredLibraries.length > 0;

  return (
    <div className="p-6">
      {/* Container for grid and overlay */}
      <div className="relative">
        {/* Grid */}
        <div className={`grid ${getGridCols()} ${getGridGap()}`}>
          {/* Normal libraries */}
          {normalLibraries.map((library) => (
            <MemoizedLibraryCard
              key={library.id}
              library={library}
              onLibraryClick={onLibraryClick}
              cardSize={cardsPerRow === 2 ? 'large' : 'normal'}
              auth={authData}
              ziggy={ziggyData}
              onStarClick={onStarClick}
              userLibraryIds={userLibraryIds}
              viewedLibraryIds={viewedLibraryIds}
              onLibraryViewed={onLibraryViewed}
              userPlanLimits={userPlanLimits}
            />
          ))}
        </div>

        {/* Login Prompt positioned after visible cards with gradient overlay */}
        {showLoginPrompt && (
            <div className="relative -mt-[500px] pt-80 pb-10 text-center flex flex-col items-center justify-center px-4 rounded-2xl" style={{ background: 'linear-gradient(179.63deg, rgba(248, 248, 249, 0) 0%, #FFFFFF 40%, #F6F5FA 85%)' }}>
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl pt-10 font-bold text-[#BCBCC7] dark:text-white mb-2 font-sora">
                  You're <span className="text-[#2B235A] dark:text-[#8a7eff] font-extrabold">one click away</span> from
                  </h2>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#BCBCC7] dark:text-gray-400 mb-6 font-sora">
                  unlimited inspiration
                  </p>

                  <p className="max-w-2xl text-sm sm:text-sm text-[#9D9DA8] dark:text-gray-400 mb-8 text-center font-poppins mx-auto">
                  3,000+ UI animations from 600+ real apps across 200+ categories. <br />
                  <span className='font-semibold text-[#9D9DA8]'>Covering web, mobile, smartwatches and even AR/VR.</span>
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-4 mb-10">
                  <Link
                      href="/login"
                      className="px-6 py-2 holographic-link2 bg-[#F2EDFF] border border-[#CECCFF] rounded-[4px] font-sora text-base !font-semibold text-[#2B235A] hover:opacity-95 transition-opacity duration-500 focus:outline-none focus:ring-0"
                  >
                    <span className='z-10'>Log In</span>

                  </Link>
                  <Link
                      href="/register"
                      className="px-6 py-2 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] font-sora text-base text-white rounded-[4px] !font-semibold hover:opacity-95 transition-opacity duration-500 shadow-[4px_4px_12px_0px_#260F6329] focus:outline-none focus:ring-0"
                  >
                    <span className='z-10'>
                        Join Free
                    </span>

                  </Link>
                  </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-sora">
                  Where designers from the world's leading teams spark interaction ideas
                  </p>
                  {/* Brand Logos with automatic scrolling animation */}
                  {/* Brand Logos with automatic scrolling animation */}
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
                        {/* First set */}
                        <div className="flex items-center gap-6 shrink-0 px-3">
                        <img src="images/brand/git.png" alt="GitHub" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/airbnb.png" alt="Airbnb" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/notion.png" alt="Notion" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/slack.png" alt="Slack" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/atlasian.png" alt="Atlassian" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/spotify.png" alt="Spotify" className="h-6 grayscale opacity-70" />
                        </div>
                        {/* Second set (duplicate) - must be identical */}
                        <div className="flex items-center gap-6 shrink-0 px-3">
                        <img src="images/brand/git.png" alt="GitHub" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/airbnb.png" alt="Airbnb" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/notion.png" alt="Notion" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/slack.png" alt="Slack" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/atlasian.png" alt="Atlassian" className="h-6 grayscale opacity-70" />
                        <img src="images/brand/spotify.png" alt="Spotify" className="h-6 grayscale opacity-70" />
                        </div>
                    </div>
                    </div>


                </div>
            </div>
            )}

      </div>

      {/* Loading State */}
      {isLoadingMore && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#564638] rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more libraries...</p>
        </div>
      )}

      {/* End message when no more content */}
      {isUserAuthenticated && !hasMore && libraries.length > 20 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            You've reached the end!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {libraries.length} libraries loaded
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;
