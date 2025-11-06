import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import { Infinity } from 'lucide-react';
import InFeedAdCard from './InFeedAdCard';

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

interface InFeedAd {
  id: number;
  title: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  media_url: string;
  target_url: string;
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

// Memoized library card
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

// Memoized brand logo component
const BrandLogo = memo<{ src: string; alt: string }>(({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex items-center justify-center w-24 h-10 bg-transparent">
      {!hasError ? (
        <>
          {!isLoaded && (
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
            decoding="async"
          />
        </>
      ) : (
        <div className="w-20 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">{alt}</span>
        </div>
      )}
    </div>
  );
});

BrandLogo.displayName = 'BrandLogo';

// Scrolling brands section
const ScrollingBrands = memo(() => {
  const brands = useMemo(() => [
    { src: "images/brand/atlas.png", alt: "Atlassian" },
    { src: "images/brand/air.png", alt: "Airbnb" },
    { src: "images/brand/monday.png", alt: "Monday" },
    { src: "images/brand/klarna.png", alt: "Klarna" },
    { src: "images/brand/spotify.png", alt: "Spotify" },
    { src: "images/brand/plaid.png", alt: "Plaid" },
    { src: "images/brand/linktree.png", alt: "Linktree" },
  ], []);

  return (
    <>
      <style>{`
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
              {brands.map((brand, index) => (
                <BrandLogo key={`${i}-${index}`} src={brand.src} alt={brand.alt} />
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F6F5FA] dark:from-gray-900 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F6F5FA] dark:from-gray-900 to-transparent"></div>
      </div>
    </>
  );
});

ScrollingBrands.displayName = 'ScrollingBrands';

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
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const isUserAuthenticated = isAuthenticated ?? !!authData?.user;

  const [isNearBottom, setIsNearBottom] = useState(false);
  const [inFeedAds, setInFeedAds] = useState<InFeedAd[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);

  // Fetch in-feed ads
  useEffect(() => {
    const fetchInFeedAds = async () => {
      try {
        setIsLoadingAds(true);
        const response = await fetch('/ads/in-feed-placements');
        const result = await response.json();

        if (result.success && result.data) {
          // Fetch each ad placement
          const adPromises = result.data.map(async (placement: { link: string }) => {
            const adResponse = await fetch(`/ads/in-feed/${placement.link}?t=${Date.now()}`);
            const adResult = await adResponse.json();
            return adResult.success && adResult.data ? adResult.data : null;
          });

          const ads = await Promise.all(adPromises);
          const validAds = ads.filter(ad => ad !== null);
          setInFeedAds(validAds);
        }
      } catch (error) {
        console.error('Failed to fetch in-feed ads:', error);
      } finally {
        setIsLoadingAds(false);
      }
    };

    fetchInFeedAds();
  }, []);

  // Grid columns
  const gridCols = useMemo(() => {
    switch (cardsPerRow) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 lg:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  }, [cardsPerRow]);

  const gridGap = useMemo(() => cardsPerRow === 2 ? 'gap-8' : 'gap-6', [cardsPerRow]);
  const cardSize = useMemo(() => cardsPerRow === 2 ? 'large' : 'normal', [cardsPerRow]);

  // Split libraries for unauthenticated users
  const { normalLibraries, blurredLibraries, showLoginPrompt } = useMemo(() => {
    if (!libraries || !Array.isArray(libraries)) {
      return { normalLibraries: [], blurredLibraries: [], showLoginPrompt: false };
    }

    const normal = isUserAuthenticated ? libraries : libraries.slice(0, 18);
    const blurred = isUserAuthenticated ? [] : libraries.slice(15, 18);
    const showPrompt = !isUserAuthenticated && blurred.length > 0;

    return { normalLibraries: normal, blurredLibraries: blurred, showLoginPrompt: showPrompt };
  }, [libraries, isUserAuthenticated]);

  // Merge libraries with ads at specific positions
  const mergedItems = useMemo(() => {
    const items: Array<{ type: 'library' | 'ad'; data: Library | InFeedAd; key: string }> = [];

    // No ads if we don't have any
    if (inFeedAds.length === 0) {
      normalLibraries.forEach((library) => {
        items.push({
          type: 'library',
          data: library,
          key: `library-${library.id}`
        });
      });
      return items;
    }

    let adIndex = 0;

    normalLibraries.forEach((library, index) => {
      items.push({
        type: 'library',
        data: library,
        key: `library-${library.id}`
      });

      // Check if we should insert an ad after this library
      // Ad positions: 3rd (index 2), 13th (index 12), 23rd (index 22), etc.
      // Pattern: index 2, then every 10 thereafter (2, 12, 22, 32, 42...)
      // Formula: (index - 2) % 10 === 0 and index >= 2
      if (index >= 2 && (index - 2) % 10 === 0) {
        const ad = inFeedAds[adIndex % inFeedAds.length];
        items.push({
          type: 'ad',
          data: ad,
          key: `ad-${index}-${ad.id}-1`
        });
        adIndex++;
      }
    });

    return items;
  }, [normalLibraries, inFeedAds]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const isNear = scrollTop + windowHeight >= documentHeight - 800;
    setIsNearBottom(isNear);

    if (isNear && hasMore && !isLoadingMore && onLoadMore && isUserAuthenticated) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore, isUserAuthenticated]);

  // Throttled scroll event
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 150);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Loading state
  if (!libraries) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#564638] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading libraries...</p>
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
    return <div className="p-6">{/* Empty state */}</div>;
  }

  return (
    <div className="p-6">
      <div className="relative">
        {/* Grid with merged libraries and ads */}
        <div className={`grid ${gridCols} ${gridGap}`}>
          {mergedItems.map((item) => {
            if (item.type === 'library') {
              const library = item.data as Library;
              return (
                <MemoizedLibraryCard
                  key={item.key}
                  library={library}
                  onLibraryClick={onLibraryClick}
                  cardSize={cardSize}
                  auth={authData}
                  ziggy={ziggyData}
                  onStarClick={onStarClick}
                  userLibraryIds={userLibraryIds}
                  viewedLibraryIds={viewedLibraryIds}
                  onLibraryViewed={onLibraryViewed}
                  userPlanLimits={userPlanLimits}
                />
              );
            } else {
              const ad = item.data as InFeedAd;
              return (
                <InFeedAdCard
                  key={item.key}
                  ad={ad}
                  cardSize={cardSize}
                />
              );
            }
          })}
        </div>

        {/* Login Prompt */}
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

              <ScrollingBrands />
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

      {/* End message */}
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
