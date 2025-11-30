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
  categories: Category[];
  industries: Array<{ id: number; name: string; slug?: string }>;
  interactions: Array<{ id: number; name: string; slug?: string }>;
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

// ============================================
// IMAGE CACHE MANAGER - PREVENTS RELOADING
// ============================================
class ImageCacheManager {
  // Static properties - shared across all instances
  private static cache = new Map<string, string>();
  private static loading = new Set<string>();
  private static loadingPromises = new Map<string, Promise<string>>();

  static async loadImage(url: string): Promise<string> {
    // 1. Check if image is already in cache
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // 2. Check if image is currently being loaded
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // 3. Start loading the image
    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.cache.set(url, url);
        this.loading.delete(url);
        this.loadingPromises.delete(url);
        resolve(url);
      };

      img.onerror = () => {
        this.loading.delete(url);
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });

    this.loading.add(url);
    this.loadingPromises.set(url, promise);
    return promise;
  }

  static isLoading(url: string): boolean {
    return this.loading.has(url);
  }

  static isCached(url: string): boolean {
    return this.cache.has(url);
  }
}

// ============================================
// GLOBAL VIDEO MANAGER
// ============================================
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
            if (video && !video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
  }

  private startMonitoring() {
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

// ============================================
// LIBRARY CARD COMPONENT
// ============================================
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
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // Video state
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoManagerRef = useRef<VideoManager>(VideoManager.getInstance());

  // NEW: Category image state
  const [categoryImageUrl, setCategoryImageUrl] = useState<string | null>(null);
  const [isCategoryImageLoading, setIsCategoryImageLoading] = useState(true);
  const [categoryImageError, setCategoryImageError] = useState(false);

  // Modal states
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLibrarySelectionModal, setShowLibrarySelectionModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);

  // Library IDs
  const [localUserLibraryIds, setLocalUserLibraryIds] = useState<number[]>(userLibraryIds);
  const [localViewedLibraryIds, setLocalViewedLibraryIds] = useState<number[]>(viewedLibraryIds);

  // Lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // ============================================
  // NEW: LOAD CATEGORY IMAGE PROGRESSIVELY
  // ============================================
  useEffect(() => {
    const categoryImage = getCategoryImage();

    if (!categoryImage) {
      setIsCategoryImageLoading(false);
      return;
    }

    // Check if already cached
    if (ImageCacheManager.isCached(categoryImage)) {
      setCategoryImageUrl(categoryImage);
      setIsCategoryImageLoading(false);
      return;
    }

    // Load image in background
    ImageCacheManager.loadImage(categoryImage)
      .then((url) => {
        setCategoryImageUrl(url);
        setIsCategoryImageLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load category image:', error);
        setCategoryImageError(true);
        setIsCategoryImageLoading(false);
      });
  }, [library.categories]);

  // Update local state when props change
  useEffect(() => {
    setLocalUserLibraryIds(userLibraryIds);
  }, [userLibraryIds]);

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

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const isStarred = localUserLibraryIds.includes(library.id);

  const isNewLibrary = () => {
    return !localViewedLibraryIds.includes(library.id);
  };

  const trackLibraryView = async (libraryId: number) => {
    try {
      await fetch(`/api/libraries/${libraryId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      setLocalViewedLibraryIds(prev => {
        if (prev.includes(libraryId)) return prev;
        return [...prev, libraryId];
      });

      if (onLibraryViewed) {
        onLibraryViewed(libraryId);
      }
    } catch (error) {
      console.error('Error tracking library view:', error);
    }
  };

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

  const handleVideoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await trackLibraryView(library.id);

    try {
      const previousUrl = window.location.pathname + window.location.search;
      const newUrl = `/library/${library.slug}`;
      window.history.pushState({ fromModal: true, previousUrl: previousUrl }, '', newUrl);

      const response = await fetch(`/api/libraries/${library.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();

      if (onClick) {
        onClick(data.library);
      }
    } catch (error) {
      console.error('Error opening library modal:', error);

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

    await fetchUserBoards();
    setShowLibrarySelectionModal(true);
  };

  const handleCreateBoardFromModal = () => {
    setShowLibrarySelectionModal(false);
    setShowBoardModal(true);
  };

  const handleBoardModalClose = () => {
    setShowBoardModal(false);
    fetchUserBoards().then(() => {
      setShowLibrarySelectionModal(true);
    });
  };

  const handleLibrarySelectionClose = async () => {
    setShowLibrarySelectionModal(false);
    await refreshUserLibraryIds();

    if (onStarClick) {
      const newIsStarred = localUserLibraryIds.includes(library.id);
      onStarClick(library, newIsStarred);
    }
  };

  const handleLibraryAdded = async () => {
    await refreshUserLibraryIds();

    if (onStarClick) {
      onStarClick(library, true);
    }
  };

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
  };

  // ============================================
  // STYLING FUNCTIONS
  // ============================================
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <div
        ref={ref}
        className={`relative overflow-hidden group border border-transparent bg-transparent hover:bg-white transition-colors duration-500 ease-in-out hover:border-[#F2F2FF] ${getCardClasses()}`}
      >
        <div className="absolute"></div>

        <div className="relative z-[8]">
          <div
            className={`${getVideoContainerClasses()}`}
            onClick={handleVideoClick}
          >
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

            {(!inView || !isVideoLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div
                  className="flex items-center justify-center bg-[#F7F7FB] rounded-xl"
                  style={{
                    width: 'calc(100% - 36px)',
                    height: 'calc(100% - 120px)',
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

            {isNewLibrary() && (
              <div className="absolute top-3 right-3 bg-[#2B235A] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                New
              </div>
            )}
          </div>

          <div className={getContentPadding()}>
            <div className="flex items-start gap-2">
              {/* OPTIMIZED: Category Image with Progressive Loading */}
              {getCategoryImage() && !categoryImageError ? (
                <div className={`bg-white dark:bg-gray-800 border border-[#8787A833] hover:shadow-[6px_0px_24px_-1px_#6D16C321,0px_6px_20px_-1px_#6D16C321] transition-shadow duration-300 overflow-hidden flex-shrink-0 ${getCategoryImageSize()}`}>
                  <Link
                    href={`/browse?category=${getCategorySlug()}`}
                    className={`font-sora !font-bold ${
                      filterValue === getCategorySlug() ? '' : ''
                    }`}
                  >
                    {isCategoryImageLoading ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                    ) : categoryImageUrl ? (
                      <img
                        src={categoryImageUrl}
                        alt="Category"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F7F7FB] flex items-center justify-center">
                        <Atom className='text-[#CECCFF] h-4 w-4'/>
                      </div>
                    )}
                  </Link>
                </div>
              ) : (
                <div className={`bg-white dark:bg-gray-800 border border-[#8787A833] flex items-center justify-center flex-shrink-0 ${getCategoryImageSize()}`}>
                  <Atom className='text-[#CECCFF] h-6 w-6'/>
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <h3 className={`font-sora text-lg text-[#2B235A] !font-bold truncate ${getTitleClasses()}`}>
                  <Link
                    href={`/browse?category=${getCategorySlug()}`}
                    className={`font-sora !font-bold outline-none focus:outline-none focus:ring-0 ${
                      filterValue === getCategorySlug() ? '' : ''
                    }`}
                  >
                    {getCategoryName()}
                  </Link>
                </h3>

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
                            href={`/browse?interaction=${interaction.slug}`}
                            className={`outline-none focus:outline-none focus:ring-0 hover:text-[#9943EE] transition-color duration-500 ${
                              filterValue === interaction.slug
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

      <MembershipModal
        isOpen={showMembershipModal}
        onClose={closeMembershipModal}
        title="Become member to Add collection"
        message="Sign up now to Add Collection, Add more unlimited interactions to your Portal, and share them with your team"
        buttonText="Login"
        redirectUrl="/login"
      />

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
