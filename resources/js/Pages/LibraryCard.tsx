import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Atom, Star } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import MembershipModal from './Website/Components/MembershipModal';
import LibrarySelectionModal from './LibrarySelectionModal';
import BoardModal from '../Components/BoardModal';

interface Category {
  id: number;
  name: string;
  image?: string;
  slug?: string;
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
  categories: Array<Category>;
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  created_at: string;
}

interface Board {
  id: number;
  name: string;
  creator_email: string;
  visibility: 'public' | 'private';
  share_via_link: boolean;
  share_via_email: boolean;
  share_emails?: string[];
  share_url?: string | null;
  created_at: string;
  has_library?: boolean;
}

interface LibraryCardProps extends PageProps {
  library: Library;
  onClick?: (library: Library) => void;
  cardSize?: 'normal' | 'large';
  userPlanLimits?: UserPlanLimits | null;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  filterType?: 'category' | 'industry' | 'interaction' | 'platform';
  filterValue?: string;
  filterName?: string;
  onStarClick?: (library: Library, isStarred: boolean) => void;
  onLibraryViewed?: (libraryId: number) => void;
}

// Global video manager to handle all videos efficiently
class VideoManager {
  private static instance: VideoManager;
  private videos: Set<HTMLVideoElement> = new Set();
  private monitorInterval: NodeJS.Timeout | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private visibleVideos: Set<HTMLVideoElement> = new Set();

  private constructor() {
    this.startMonitoring();
    this.setupIntersectionObserver();
  }

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            this.visibleVideos.add(video);
            this.playVideo(video);
          } else {
            this.visibleVideos.delete(video);
            // Optionally pause videos that are out of view to save resources
            if (video && !video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading slightly before entering viewport
      }
    );
  }

  private startMonitoring() {
    // Monitor only visible videos every 3 seconds
    this.monitorInterval = setInterval(() => {
      this.visibleVideos.forEach((video) => {
        if (video.paused && !video.ended && video.readyState >= 2) {
          this.playVideo(video);
        }
      });
    }, 3000);
  }

  private playVideo(video: HTMLVideoElement) {
    if (video && video.paused && !video.ended) {
      video.play().catch((err) => {
        // Silently handle autoplay restrictions
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error('Video play error:', err);
        }
      });
    }
  }

  register(video: HTMLVideoElement) {
    this.videos.add(video);
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(video);
    }
  }

  unregister(video: HTMLVideoElement) {
    this.videos.delete(video);
    this.visibleVideos.delete(video);
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(video);
    }
  }

  destroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.videos.clear();
    this.visibleVideos.clear();
  }
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  library,
  onClick,
  cardSize = 'normal',
  userPlanLimits,
  filterValue,
  userLibraryIds = [],
  viewedLibraryIds = [],
  onStarClick,
  onLibraryViewed,
  auth
}) => {
  const { props, url: currentUrl } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLibrarySelectionModal, setShowLibrarySelectionModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [localUserLibraryIds, setLocalUserLibraryIds] = useState<number[]>(userLibraryIds);
  const [localViewedLibraryIds, setLocalViewedLibraryIds] = useState<number[]>(viewedLibraryIds);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoManagerRef = useRef<VideoManager>(VideoManager.getInstance());

  // Lazy loading with intersection observer
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Update local state when props change
  useEffect(() => {
    setLocalUserLibraryIds(userLibraryIds);
  }, [userLibraryIds]);

  // Update viewed library IDs when props change
  useEffect(() => {
    setLocalViewedLibraryIds(viewedLibraryIds);
  }, [viewedLibraryIds]);

  // Register video with global manager
  useEffect(() => {
    const video = videoRef.current;
    if (video && inView) {
      videoManagerRef.current.register(video);

      return () => {
        videoManagerRef.current.unregister(video);
      };
    }
  }, [inView, isVideoLoaded]);

  // Check if library is starred based on local state
  const isStarred = localUserLibraryIds.includes(library.id);

  // Check if library is new (NOT viewed yet)
  const isNewLibrary = () => {
    return !localViewedLibraryIds.includes(library.id);
  };

  // Function to track library view
  const trackLibraryView = async (libraryId: number) => {
    try {
      await fetch(`/api/libraries/${libraryId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      // Update local state immediately
      setLocalViewedLibraryIds(prev => {
        if (prev.includes(libraryId)) return prev;
        return [...prev, libraryId];
      });

      // Notify parent component
      if (onLibraryViewed) {
        onLibraryViewed(libraryId);
      }
    } catch (error) {
      console.error('Error tracking library view:', error);
    }
  };

  // Function to refresh user library IDs
  const refreshUserLibraryIds = useCallback(async () => {
    if (!authData?.user) return;

    try {
      const response = await fetch('/api/user-library-ids');
      if (response.ok) {
        const data = await response.json();
        setLocalUserLibraryIds(data.library_ids || []);
      }
    } catch (error) {
      console.error('Error refreshing user library IDs:', error);
    }
  }, [authData?.user]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  // Handle video click without page reload
  const handleVideoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Track the view immediately
    await trackLibraryView(library.id);

    try {
      // Store the current URL as the previous URL (before opening modal)
      const previousUrl = window.location.pathname + window.location.search;

      // Update URL to /library/{slug} without page reload
      const newUrl = `/library/${library.slug}`;
      window.history.pushState({ fromModal: true, previousUrl: previousUrl }, '', newUrl);

      // Fetch library data
      const response = await fetch(`/api/libraries/${library.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();

      // Call the onClick handler with the library data
      if (onClick) {
        onClick(data.library);
      }
    } catch (error) {
      console.error('Error opening library modal:', error);

      // Fallback to the old method if API fails
      const libraryUrl = `/library/${library.slug}`;
      router.visit(libraryUrl, {
        preserveScroll: true,
        preserveState: true,
        only: ['selectedLibrary', 'libraries'],
        onSuccess: () => {
          if (onClick) {
            onClick(library);
          }
        }
      });
    }
  };

  const fetchUserBoards = async () => {
    if (isLoadingBoards) return;

    setIsLoadingBoards(true);
    try {
      const response = await fetch(`/api/user-boards?library_id=${library.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      }
      const data = await response.json();
      setUserBoards(data.boards || []);
    } catch (error) {
      console.error('Error fetching user boards:', error);
      setUserBoards([]);
    } finally {
      setIsLoadingBoards(false);
    }
  };

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!authData?.user) {
      setShowMembershipModal(true);
      return;
    }

    // For authenticated users, fetch boards and show selection modal
    await fetchUserBoards();
    setShowLibrarySelectionModal(true);
  };

  const handleCreateBoardFromModal = () => {
    setShowLibrarySelectionModal(false);
    setShowBoardModal(true);
  };

  const handleBoardModalClose = () => {
    setShowBoardModal(false);
    // Refresh boards and show selection modal again
    fetchUserBoards().then(() => {
      setShowLibrarySelectionModal(true);
    });
  };

  const handleLibrarySelectionClose = async () => {
    setShowLibrarySelectionModal(false);

    // Refresh the user's library IDs to update star states
    await refreshUserLibraryIds();

    // Notify parent component about the star state change if callback provided
    if (onStarClick) {
      const newIsStarred = localUserLibraryIds.includes(library.id);
      onStarClick(library, newIsStarred);
    }
  };

  const handleLibraryAdded = async () => {
    // Immediately refresh user library IDs when library is added
    await refreshUserLibraryIds();

    // Notify parent component about the change
    if (onStarClick) {
      onStarClick(library, true); // Library was just added, so it's starred
    }
  };

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
  };

  // Dynamic sizing based on cardSize prop
  const getCardClasses = () => {
    return "bg-[#F8F8F9] p-[1px] dark:bg-gray-900 rounded-lg overflow-hidden border border-transparent";
  };

  const getVideoContainerClasses = () => {
    const baseClasses = "relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 cursor-pointer";
    if (cardSize === 'large') {
      return `${baseClasses} aspect-[3/2.1]`;
    }
    return `${baseClasses} aspect-[3/2.1]`;
  };

  const getContentPadding = () => {
    return cardSize === 'large' ? 'px-7 py-6' : 'px-5 py-4';
  };

  const getTitleClasses = () => {
    const baseClasses = "text-gray-900 dark:text-white";
    if (cardSize === 'large') {
      return `${baseClasses} text-xl`;
    }
    return `${baseClasses} text-lg`;
  };

  const getCategoryImageSize = () => {
    return cardSize === 'large' ? 'w-10 h-10 rounded-md' : 'w-8 h-8 rounded-md';
  };

  const getFallbackIconSize = () => {
    return cardSize === 'large' ? 'w-16 h-16' : 'w-12 h-12';
  };

  const getFallbackIconInnerSize = () => {
    return cardSize === 'large' ? 'w-8 h-8' : 'w-6 h-6';
  };

  const getStarSize = () => {
    return cardSize === 'large' ? 26 : 20;
  };

  const getCategoryImage = () => {
    return library.categories.length > 0 ? library.categories[0].image : null;
  };

    const getCategoryName = () => {
    return library.categories.length > 0 ? library.categories[0].name : '';
  };

  const getCategorySlug = () => {
    if (library.categories.length > 0) {
      const category = library.categories[0];
      return category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    }
    return '';
  };

  return (
    <>
        <div
        ref={ref}
        className={`relative overflow-hidden group border border-transparent bg-transparent hover:bg-white transition-colors duration-500 ease-in-out hover:border-[#F2F2FF] ${getCardClasses()}`}
        >
        {/* Animated hover background */}
        <div className="absolute"></div>

        {/* Keep the rest of your card content inside this next wrapper */}
        <div className="relative z-[8]">
          <div
            className={`${getVideoContainerClasses()}`}
            onClick={handleVideoClick}
          >
            {/* Only load video when card is in view */}
            {inView && library.video_url && (
              <video
                ref={videoRef}
                src={library.video_url}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isVideoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={handleVideoLoad}
              />
            )}

            {/* Fallback when video is not loaded or not in view */}
            {(!inView || !isVideoLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div
                  className="flex items-center justify-center bg-[#F7F7FB] rounded-xl"
                  style={{
                    width: 'calc(100% - 36px)', // 18px left + 18px right
                    height: 'calc(100% - 120px)', // 60px top + 60px bottom
                  }}
                >
                  <img
                    src="images/Spin.gif"
                    height={60}
                    width={60}
                    alt="Loading..."
                  />
                </div>
              </div>
            )}

            {/* New Tag - Shows if library has NOT been viewed */}
            {isNewLibrary() && (
              <div className="absolute top-3 right-3 bg-[#2B235A] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                New
              </div>
            )}
          </div>

          {/* Content - Not clickable */}
          <div className={getContentPadding()}>
            <div className="flex items-start gap-2">
              {/* Category Image */}
              {getCategoryImage() ? (
                <div className={`bg-white dark:bg-gray-800 border border-[#8787A833] hover:shadow-[6px_0px_24px_-1px_#6D16C321,0px_6px_20px_-1px_#6D16C321] transition-shadow duration-300 overflow-hidden flex-shrink-0 ${getCategoryImageSize()}`}>
                  <Link
                    href={`/browse?category=${getCategorySlug()}`}
                    className={`font-sora !font-bold ${
                      filterValue === getCategorySlug() ? '' : ''
                    }`}
                  >
                    <img
                      src={getCategoryImage()}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
              ) : (
                <div className={`bg-white dark:bg-gray-800 border border-[#8787A833] flex items-center justify-center flex-shrink-0 ${getCategoryImageSize()}`}>
                  <Atom className='text-[#CECCFF] h-6 w-6'/>
                </div>
              )}

              {/* Title and Interactions Container */}
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                {/* Title */}
                <h3 className={`font-sora text-lg text-[#2B235A] !font-bold truncate ${getTitleClasses()}`}>
                {getCategoryName()}
                </h3>

                {/* Interactions */}
                <div className="font-medium text-[#8787A8] opacity-70">
                  {library.interactions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {library.interactions.slice(0, 2).map((interaction, index) => (
                        <span
                          key={interaction.id}
                          className={`font-sora ${
                            cardSize === 'large' ? 'text-base' : 'text-sm'
                          }`}
                        >
                          <Link
                            href={`/browse?interaction=${interaction.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className={`focus:outline-none focus:ring-0 hover:text-[#9943EE] transition-color duration-500 ${
                              filterValue === interaction.name.toLowerCase().replace(/\s+/g, '-') ? '' : ''
                            }`}
                          >
                            {interaction.name}
                          </Link>
                          {index < Math.min(library.interactions.length - 1, 1)}
                        </span>
                      ))}
                      {library.interactions.length > 2 && (
                        <span className={`text-[#8787A8] dark:text-gray-400 ${
                          cardSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          +{library.interactions.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Star Icon - Clickable */}
              <button
                onClick={handleStarClick}
                disabled={isLoadingBoards}
                className="text-[#2B235A] hover:text-[#2B235A] dark:hover:text-gray-300 transition-colors flex-shrink-0 focus:outline-none disabled:opacity-50"
                title={isStarred ? "Added to collection" : "Add to collection"}
              >
                <Star
                  size={getStarSize()}
                  fill={isStarred ? "currentColor" : "none"}
                  className={isStarred ? "text-[#2B235A]" : "text-[#2B235A]"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Modal for unauthenticated users */}
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={closeMembershipModal}
        title="Become member to Add collection"
        message="Sign up now to Add Collection, Add more unlimited interactions to your Portal, and share them with your team"
        buttonText="Login"
        redirectUrl="/login"
      />

      {/* Library Selection Modal for authenticated users */}
      <LibrarySelectionModal
        isOpen={showLibrarySelectionModal}
        onClose={handleLibrarySelectionClose}
        library={library}
        boards={userBoards}
        onCreateBoard={handleCreateBoardFromModal}
        isLoading={isLoadingBoards}
        onLibraryAdded={handleLibraryAdded}
        userPlanLimits={userPlanLimits}
      />

      {/* Board Creation Modal */}
      <BoardModal
        isOpen={showBoardModal}
        onClose={handleBoardModalClose}
        userEmail={authData?.user?.email || ''}
        userPlanLimits={userPlanLimits}
      />
    </>
  );
};

export default LibraryCard;
