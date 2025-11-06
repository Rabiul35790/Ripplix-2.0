import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Atom, ChevronRight, Command, Heart, Star, SwatchBook } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  is_top?: boolean;
}

interface Industry {
  id: number;
  name: string;
  slug?: string;
  is_top: boolean;
}

interface Interaction {
  id: number;
  name: string;
  slug?: string;
  is_top: boolean;
}

interface Ad {
  id: number;
  title: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  media_url: string;
  target_url: string;
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
  industries: Industry[];
  interactions: Interaction[];
  created_at: string;
  published_date: string;
}

interface TopLibraryGroup {
  name: string;
  slug: string;
  total_count: number;
  libraries: Library[];
  image?: string;
}

interface TopLibrarySectionProps {
  topLibrariesByCategory?: TopLibraryGroup[];
  topLibrariesByInteraction?: TopLibraryGroup[];
  topLibrariesByIndustry?: TopLibraryGroup[];
}

interface TopLibraryCardProps {
  group: TopLibraryGroup;
  type: 'category' | 'interaction' | 'industry';
  cardIndex: number;
}

const TopLibraryCard: React.FC<TopLibraryCardProps> = ({ group, type, cardIndex }) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;

      // Fixed heights based on breakpoints (keeping original heights)
      let targetHeight: number;

      if (width < 640) {
        targetHeight = 240;
      } else if (width < 768) {
        targetHeight = 310;
      } else if (width < 1024) {
        targetHeight = 260;
      } else if (width < 1280) {
        targetHeight = 320;
      } else if (width < 1536) {
        targetHeight = 340;
      } else if (width < 1920) {
        targetHeight = 320;
      } else {
        targetHeight = 360;
      }

      // Calculate video dimensions based on height
      const aspectRatio = 16 / 9;

      // First video (smallest) height should fit well in container
      const firstVideoHeight = targetHeight * 0.45; // 45% of container height
      const firstVideoWidth = firstVideoHeight * aspectRatio;

      // Calculate width for all 3 stacked videos
      // Video 1: firstVideoWidth
      // Video 2: firstVideoWidth + 18% increment
      // Video 3: firstVideoWidth + 36% increment
      const video2Width = firstVideoWidth * 1.18;
      const video3Width = firstVideoWidth * 1.36;

      // Total width needed is the widest video (video 3) plus padding
      const totalWidthNeeded = video3Width + (firstVideoWidth * 0.3); // 30% of first video as padding

      setContainerDimensions({
        width: totalWidthNeeded,
        height: targetHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getLibraryVideos = () => {
    if (!group.libraries || group.libraries.length === 0) return [];
    return group.libraries
      .filter(library => library.video_url)
      .slice(0, 3)
      .map(library => library.video_url);
  };

  const libraryVideos = getLibraryVideos();
  const libraryCount = group.total_count || group.libraries.length;

  const getBrowseUrl = () => {
    const slug = group.slug;
    if (!slug) return '/';

    if (type === 'category') {
      return `/browse?category=${slug}`;
    } else if (type === 'interaction') {
      return `/browse?interaction=${slug}`;
    } else if (type === 'industry') {
      return `/browse?industry=${slug}`;
    }
    return '/';
  };

  const getBgColor = (cardIndex: number) => {
    if (type === 'category') {
      const bgColors = ['bg-[#feffff]', 'bg-[#fdffff]', 'bg-[#eff6f8]'];
      return bgColors[cardIndex] || 'bg-white';
    }
    if (type === 'interaction') {
      const bgColors = ['bg-[#FFFFFF]', 'bg-[#FFFFFF]', 'bg-[#FFFFFF]'];
      return bgColors[cardIndex] || 'bg-white';
    }
    if (type === 'industry') {
      const bgColors = ['bg-[#FFFFFF]', 'bg-[#FFFFFF]', 'bg-[#FFFFFF]'];
      return bgColors[cardIndex] || 'bg-white';
    }
    return 'bg-white';
  };

  const getVideoDimensions = () => {
    const { width: containerWidth, height: containerHeight } = containerDimensions;
    const aspectRatio = 16 / 9;

    // Base video dimensions
    const firstVideoHeight = containerHeight * 0.45;
    const firstVideoWidth = firstVideoHeight * aspectRatio;

    // Calculate dimensions for each layer
    const layers = libraryVideos.map((_, index) => {
      // Each subsequent video is 18% wider than previous
      const videoWidth = firstVideoWidth * (1 + (index * 0.18));
      const videoHeight = videoWidth / aspectRatio;

      // Calculate offsets to create stacked effect with top edges visible
      const offsetY = index * (videoHeight * 0.15); // Offset based on video height
      const offsetX = ((containerWidth - videoWidth) / 2) - 15; // Center horizontally

      return {
        width: videoWidth,
        height: videoHeight,
        top: offsetY,
        left: offsetX,
        zIndex: index
      };
    });

    return layers;
  };

  const videoDimensions = getVideoDimensions();

  return (
    <Link
      href={getBrowseUrl()}
      className={`w-full font-sora ${getBgColor(cardIndex)} rounded-lg border border-[#E3E2FF] overflow-hidden focus:outline-none focus:ring-0 block p-3 sm:p-4 lg:p-5`}
      style={{ maxWidth: `${containerDimensions.width}px` }}
    >
      {/* Header Section */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
        {type === 'category' && group.image && (
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={group.image}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-[#2B235A] font-semibold text-xl sm:text-xl leading-tight mb-1 truncate">
            {group.name}{type === 'interaction' ? ' Animation' : ''}
          </h3>
          <p className="text-[#62626C] text-xs sm:text-sm">
            {libraryCount <= 9 ? '0' : ''}{libraryCount} Animation{libraryCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Video Stack Section */}
      <div
        className="w-full flex items-center justify-center rounded-md overflow-hidden relative"
        style={{ height: `${containerDimensions.height}px` }}
      >
        {libraryVideos.length > 0 ? (
          <div className="relative w-full h-full">
            {libraryVideos.map((videoUrl, index) => {
              const dimensions = videoDimensions[index];

              return (
                <div
                  key={index}
                  className="absolute rounded-lg overflow-hidden border border-gray-200 bg-white lg:mt-10 md:mt-10"
                  style={{
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                    top: `${dimensions.top}px`,
                    left: `${dimensions.left}px`,
                    zIndex: dimensions.zIndex,
                  }}
                >
                  <video
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                    }}
                    onLoadedData={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.play().catch(() => {});
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-[#F5F5FA]">
            <Atom className="w-6 h-6 sm:w-8 sm:h-8 text-[#CECCFF]" />
          </div>
        )}
      </div>
    </Link>
  );
};

const TopLibrariesSection: React.FC<TopLibrarySectionProps> = ({
  topLibrariesByCategory = [],
  topLibrariesByInteraction = [],
  topLibrariesByIndustry = []
}) => {
const [homeAd, setHomeAd] = useState<Ad | null>(null);
const [isLoadingAd, setIsLoadingAd] = useState(true);

useEffect(() => {
  const fetchHomeAd = async () => {
    try {
      setIsLoadingAd(true);
      const response = await fetch(`/ads/home?t=${Date.now()}`);
      const result = await response.json();

      if (result.success && result.data && result.data !== null) {
        setHomeAd(result.data);
      } else {
        setHomeAd(null);
      }
    } catch (error) {
      console.error('Failed to fetch home ad:', error);
      setHomeAd(null);
    } finally {
      setIsLoadingAd(false);
    }
  };

  fetchHomeAd();
}, []);

const trackAdClick = async (adId: number) => {
  try {
    await fetch(`/ads/${adId}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    });
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
};

const handleAdClick = (ad: Ad) => {
  trackAdClick(ad.id);
  window.open(ad.target_url, '_blank');
};

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-14 mt-12 sm:mt-16 lg:mt-12 pb-8 sm:pb-10 lg:pb-12 space-y-12 sm:space-y-16 lg:space-y-16 font-sora">
      {/* Top Apps Section */}
      {topLibrariesByCategory.length > 0 && (
        <div>
          <div className="flex items-start justify-between mb-4 sm:mb-5 lg:mb-6">
            {/* Left side: Icon + Title + Description */}
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[#FFE7CD] flex items-center justify-center flex-shrink-0">
                <Command className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFA31E]" />
              </div>

              {/* Title + Description */}
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2B235A] mb-2">
                  Top Apps
                </h2>
                <p className="text-sm sm:text-base text-[#7F7F8A] max-w-3xl leading-relaxed font-poppins font-light">
                  Discover the most-loved digital products, beautifully curated for design inspiration and motion study. Immerse yourself in smooth transitions, thoughtful gestures.
                </p>
              </div>
            </div>

            {/* Right side: See All button */}
            <Link
              href="/all-apps"
              className="flex items-center gap-1 text-xs sm:text-sm bg-[#F5F5FA] border border-[#CECCFF] px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-[#2B235A] hover:text-[#9943EE] transition-colors font-medium whitespace-nowrap"
            >
              See All
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Grid of apps - with auto-fit to wrap cards naturally */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,350px),1fr))] gap-3 sm:gap-4 lg:gap-5 justify-items-center">
            {topLibrariesByCategory.slice(0, 3).map((group, index) => (
              <TopLibraryCard key={index} group={group} type="category" cardIndex={index} />
            ))}
          </div>
        </div>
      )}

      {/* Home Ad Section - Full Width */}
      <div className="w-full">
  {isLoadingAd ? (
    <div className="w-full h-40 sm:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="w-full h-full px-1 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  ) : homeAd ? (
    <button
      onClick={() => handleAdClick(homeAd)}
      className="relative w-full px-1 block hover:opacity-90 transition-opacity focus:outline-none outline-none rounded-lg overflow-hidden bg-white"
    >
      {/* Sponsor label */}
      <span className="absolute top-2 left-2 bg-[#2B235A]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md dark:bg-orange-500/80">
        Sponsor
      </span>

      {homeAd.media_type === 'video' ? (
        <video
          src={homeAd.video_url || ''}
          className="w-full h-auto max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-96 object-contain mx-auto rounded-lg"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            const target = e.target as HTMLVideoElement
            target.style.display = 'none'
          }}
        />
      ) : (
        <img
          src={homeAd.image_url || ''}
          alt={homeAd.title}
          className="w-full h-auto max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-96 object-contain mx-auto rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      )}
    </button>
  ) : (
    <div className="relative w-full h-40 sm:h-48 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 sm:p-8 border border-[#CECCFF] dark:border-orange-800">
      {/* Sponsor label (optional placeholder) */}
      <span className="absolute top-2 left-2 bg-[#2B235A]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md dark:bg-orange-500/80">
        Sponsor
      </span>

      <div className="text-center h-full flex flex-col items-center justify-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#CECCFF] dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#2B235A] dark:text-orange-400" />
        </div>
        <p className="text-sm sm:text-base text-[#2B235A] opacity-75 dark:text-gray-300 mb-3 font-medium">
          Want to advertise here?
        </p>
        <Link
          href="/contact-us"
          className="text-sm sm:text-base font-semibold text-[#2B235A] hover:font-bold dark:text-orange-400 dark:hover:text-orange-300 outline-none focus:outline-none underline transition duration-500"
        >
          Contact us
        </Link>
      </div>
    </div>
  )}
</div>


      {/* Top Elements Section */}
      {topLibrariesByInteraction.length > 0 && (
        <div>
          <div className="flex items-start justify-between mb-4 sm:mb-5 lg:mb-6">
            {/* Left side: Icon + Title + Description */}
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[#E8D2FC] flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#9943EE]" />
              </div>

              {/* Title + Description */}
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2B235A] mb-2">
                  Top Elements
                </h2>
                <p className="text-sm sm:text-base text-[#7F7F8A] max-w-3xl leading-relaxed font-poppins font-light">
                  Explore the most-used UI elements, thoughtfully curated for motion, interaction, and visual inspiration. See how micro-animations and transitions shape seamless.
                </p>
              </div>
            </div>

            {/* Right side: See All button */}
            <Link
              href="/all-elements"
              className="flex items-center gap-1 text-xs sm:text-sm bg-[#F5F5FA] border border-[#CECCFF] px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-[#2B235A] hover:text-[#9943EE] transition-colors font-medium whitespace-nowrap"
            >
              See All
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Grid of elements - with auto-fit to wrap cards naturally */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,350px),1fr))] gap-3 sm:gap-4 lg:gap-5 justify-items-center">
            {topLibrariesByInteraction.slice(0, 3).map((group, index) => (
              <TopLibraryCard key={index} group={group} type="interaction" cardIndex={index}/>
            ))}
          </div>
        </div>
      )}

      {/* Top Industries Section */}
      {topLibrariesByIndustry.length > 0 && (
        <div>
          <div className="flex items-start justify-between mb-4 sm:mb-5 lg:mb-6">
            {/* Left side: Icon + Title + Description */}
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[#D6EDFC] flex items-center justify-center flex-shrink-0">
                <SwatchBook className="w-4 h-4 sm:w-5 sm:h-5 text-[#42B0EF]" />
              </div>

              {/* Title + Description */}
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2B235A] mb-2">
                  Top Industries
                </h2>
                <p className="text-sm sm:text-base text-[#7F7F8A] max-w-3xl leading-relaxed font-poppins font-light">
                  Explore leading industries shaping digital design — from fintech to health, travel, and education. Discover how each sector defines its own motion language.
                </p>
              </div>
            </div>

            {/* Right side: See All button */}
            <Link
              href="/all-categories"
              className="flex items-center gap-1 text-xs sm:text-sm bg-[#F5F5FA] border border-[#CECCFF] px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-[#2B235A] hover:text-[#9943EE] transition-colors font-medium whitespace-nowrap"
            >
              See All
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Grid of industries - with auto-fit to wrap cards naturally */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,350px),1fr))] gap-3 sm:gap-4 lg:gap-5 justify-items-center">
            {topLibrariesByIndustry.slice(0, 3).map((group, index) => (
              <TopLibraryCard key={index} group={group} type="industry" cardIndex={index}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopLibrariesSection;
