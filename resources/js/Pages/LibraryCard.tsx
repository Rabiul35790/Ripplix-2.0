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
  meta_title?: string;
  image?: string;
  slug?: string;
  product_url?: string;
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
  seo_title?: string;
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

// Image Cache Manager
class ImageCacheManager {
  private static cache = new Map<string, string>();
  private static loading = new Set<string>();
  private static loadingPromises = new Map<string, Promise<string>>();

  static async loadImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

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

// Global Video Manager
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

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoManagerRef = useRef<VideoManager>(VideoManager.getInstance());

  const [categoryImageUrl, setCategoryImageUrl] = useState<string | null>(null);
  const [isCategoryImageLoading, setIsCategoryImageLoading] = useState(true);
  const [categoryImageError, setCategoryImageError] = useState(false);

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLibrarySelectionModal, setShowLibrarySelectionModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);

  const [localUserLibraryIds, setLocalUserLibraryIds] = useState<number[]>(userLibraryIds);
  const [localViewedLibraryIds, setLocalViewedLibraryIds] = useState<number[]>(viewedLibraryIds);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Get platform type
  const getPlatformType = (): string => {
    if (library.platforms.length > 0) {
      return library.platforms[0].name;
    }
    return 'Smartwatch'; // Default
  };

  const platformType = getPlatformType();

  useEffect(() => {
    const categoryImage = getCategoryImage();

    if (!categoryImage) {
      setIsCategoryImageLoading(false);
      return;
    }

    if (ImageCacheManager.isCached(categoryImage)) {
      setCategoryImageUrl(categoryImage);
      setIsCategoryImageLoading(false);
      return;
    }

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

  useEffect(() => {
    setLocalUserLibraryIds(userLibraryIds);
  }, [userLibraryIds]);

  useEffect(() => {
    setLocalViewedLibraryIds(viewedLibraryIds);
  }, [viewedLibraryIds]);

  const handleLibraryViewed = useCallback((libraryId: number) => {
    setLocalViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
    if (onLibraryViewed) {
      onLibraryViewed(libraryId);
    }
  }, [onLibraryViewed]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && inView) {
      videoManagerRef.current.register(video);
      return () => {
        videoManagerRef.current.unregister(video);
      };
    }
  }, [inView, isVideoLoaded]);

  const isStarred = localUserLibraryIds.includes(library.id);

  const isNewLibrary = () => {
    return !localViewedLibraryIds.includes(library.id);
  };

  const trackLibraryView = async (libraryId: number) => {
    setLocalViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });

    if (onLibraryViewed) {
      onLibraryViewed(libraryId);
    }

    fetch(`/api/libraries/${libraryId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    }).catch(() => {});
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

  const handleVideoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const previousUrl = window.location.pathname + window.location.search;
    const newUrl = `/library/${library.slug}`;
    const isAlreadyInModal = window.location.pathname.startsWith('/library/');

    if (!isAlreadyInModal) {
      window.history.pushState({
        fromModal: true,
        originalUrl: previousUrl
      }, '', newUrl);
    } else {
      window.history.replaceState({
        fromModal: true,
        originalUrl: window.history.state?.originalUrl || previousUrl
      }, '', newUrl);
    }

    if (onClick) {
      onClick(library);
    }

    trackLibraryView(library.id);

    fetch(`/api/libraries/${library.slug}`, {
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Response not ok');
      })
      .then(data => {
        if (onClick && data.library && data.library.id === library.id) {
          onClick(data.library);
        }
      })
      .catch(() => {});
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

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const getCardClasses = () => {
    return "bg-[#F8F8F9] p-[1px] dark:bg-gray-900 rounded-lg overflow-hidden border border-transparent";
  };

  const getVideoContainerClasses = () => {
    const baseClasses = "relative rounded-lg overflow-hidden bg-transparent cursor-pointer";

    if (platformType === 'Web App' || platformType === 'Website') {
      if (cardSize === 'large') {
        return `${baseClasses} sm:aspect-[4/2.7]`;
      }
      return `${baseClasses} sm:aspect-[4/2.6]`;
    }

    if (platformType === 'AR VR') {
      if (cardSize === 'large') {
        return `${baseClasses} aspect-[4/2.7]`;
      }
      return `${baseClasses} aspect-[4/2.6]`;
    }

    // Mobile App and Smartwatch (default)
    if (cardSize === 'large') {
      return `${baseClasses} aspect-[4/2.7]`;
    }
    return `${baseClasses} aspect-[4/2.6]`;
  };

  const getMobilewidthClasses = () => {
    if(cardSize === 'large') {
        return `sm:w-[30%]`;
    }
    return `sm:w-[30%]`;
  };

  const getbottombuttonposition = () => {
    return cardSize === 'large' ? 'top-[38%]' : 'top-[42%]';
  };

  const getmiddlebuttonposition = () => {
    return cardSize === 'large' ? 'top-[27%]' : 'top-[27%]';
  };

  const gettopbuttonposition = () => {
    return cardSize === 'large' ? 'top-[18%]' : 'top-[15%]';
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
    if (library.seo_title && library.seo_title.trim() !== '') {
      return library.seo_title;
    }

    if (library.categories.length === 0) return '';

    return library.categories[0].name || '';
  };

  const getCategorySlug = () => {
    if (library.categories.length > 0) {
      const category = library.categories[0];
      return category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    }
    return '';
  };

  const getCategoryProductUrl = () => {
    return library.categories.length > 0 ? library.categories[0].product_url : null;
  };

  console.log("title is the ", library.seo_title);

  // Render video content based on platform type
  const renderVideoContent = () => {
    if (!inView || !library.video_url) return null;

    // Web App / Website
    if (platformType === 'Web App' || platformType === 'Website') {
      return (
        <div className="w-full h-full bg-[#f1f1f1] flex items-center justify-center overflow-hidden">
          <div className="w-[85%] h-[80%] flex flex-col rounded-xl overflow-hidden border border-[#c0c0c0]">
            {/* Safari Top Bar */}
            <div className="h-9 bg-[#f6f6f8] flex items-center px-3 gap-3 border-b">
              {/* Traffic Lights */}
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
              </div>
              {/* Address Bar */}
              <div className="flex-1 flex justify-center">
                <div className="w-[60%] h-6 bg-white rounded-md text-[11px] text-gray-500 flex items-center justify-center border">
                  {getCategoryProductUrl()}
                </div>
              </div>
            </div>
            {/* Video */}
            <div className="flex-1 bg-transparent overflow-hidden">
              <video
                ref={videoRef}
                src={library.video_url}
                className={`w-full h-full object-cover scale-x-[1.13] scale-y-[1.4]
                  transition-all duration-500 ${
                    isVideoLoaded ? 'opacity-100 blur-0' : 'opacity-100 blur-md'
                  }`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={handleVideoLoad}
              />
            </div>
          </div>
        </div>
      );
    }

    // Mobile App
    if (platformType === 'Mobile App') {
      return (
        <div className="w-full h-full bg-[#f1f1f1] flex items-center justify-center overflow-hidden">
          {/* Ambient + Ground Shadow */}
          <div className="relative">
            <div className="absolute inset-0 -z-10
              bg-black/30 blur-2xl rounded-[2.5rem]
              translate-y-6 scale-[0.95]" />
          </div>
          {/* iPhone Body */}
          <div className={`w-[34%] ${getMobilewidthClasses()} relative h-[98%] sm:h-[90%]
            rounded-[1.8rem] p-[4px]
            bg-gradient-to-b from-[#2c2c2c] via-[#121212] to-black
            shadow-[0_35px_70px_-20px_rgba(0,0,0,0.5)]
          `}>
            {/* Metal Edge */}
            <div className="relative w-full h-full rounded-[1.4rem]
               bg-gray-700 p-[2px]">
              {/* Screen */}
              <div className="relative w-full h-full bg-black rounded-[1.4rem] overflow-hidden">
                {/* Glass Reflection */}
                <div className="absolute inset-0 pointer-events-none
                  bg-gradient-to-tr from-white/5 via-transparent to-white/10
                  z-10" />
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2
                  w-[33%] h-[12px]
                  bg-black rounded-full
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)]
                  z-20" />
                {/* Video */}
                <video
                  ref={videoRef}
                  src={library.video_url}
                  className={`w-full h-full object-cover scale-x-[1.1] scale-y-[1.13]
                    transition-all duration-500 ${
                      isVideoLoaded ? 'opacity-100 blur-0' : 'opacity-100 blur-md'
                    }`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={handleVideoLoad}
                />
              </div>
            </div>
            {/* Side Buttons */}
            <span className={`absolute left-[-1px] sm:left-[-2px]
              w-[1px] sm:w-[2px] ${gettopbuttonposition()} h-4 sm:h-6 bg-[#1B0D0A]
              rounded-full shadow-md`}></span>
            <span className={`absolute left-[-1px] sm:left-[-2px] ${getmiddlebuttonposition()} rounded-l
              w-[1px] sm:w-[2px] h-5 sm:h-10 bg-[#1B0D0A]
              rounded-full shadow-md`}></span>
            <span className={`absolute left-[-1px] sm:left-[-2px] ${getbottombuttonposition()}
              w-[1px] sm:w-[2px] h-5 sm:h-10 bg-[#1B0D0A]
              rounded-full shadow-md`}></span>
            <span className="absolute right-[-1px] sm:right-[-2px] top-[25%]
              w-[1px] sm:w-[2px] h-[40px] sm:h-[66px] bg-[#1B0D0A]
              rounded-full shadow-md"></span>
          </div>
        </div>
      );
    }

    // AR VR
    if (platformType === 'AR VR') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#f1f1f1] overflow-hidden relative">
          {/* VIDEO WITH MASK */}
          <div className="w-[95%] h-[95%] vr-mask overflow-hidden relative">
            <video
              ref={videoRef}
              src={library.video_url}
              className={`w-full h-full object-cover
                scale-x-[1.15] scale-y-[1.2]
                transition-all duration-500
                ${isVideoLoaded ? 'opacity-100 blur-0' : 'opacity-100 blur-md'}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={handleVideoLoad}
            />
            {/* BORDER OVERLAY */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="
                  M921.644 0.03
                  C964.52 -1.29 1000 26.8 1000 61.4
                  V538.4
                  C1000 574.1 962.138 602.2 917.902 599.3
                  L505.47 572.3
                  C501.408 572.0 497.324 572.0 493.262 572.3
                  L82.113 599.2
                  C37.873 602.1 0.0004 574.1 0 538.3
                  V61.4
                  C0.0003 26.8 35.48 -1.29 78.356 0.03
                  L499.918 10.6
                  L921.644 0.03
                  Z"
                stroke="#595959"
                strokeWidth="20"
                fill="transparent"
              />
            </svg>
          </div>
        </div>
      );
    }

    // Smartwatch (default)
    return (
      <>
        <video
          ref={videoRef}
          src={library.video_url}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isVideoLoaded ? 'opacity-100 blur-0' : 'opacity-100 blur-md'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoad}
        />
        {isNewLibrary() && (
          <div className="absolute top-3 right-3 bg-[#2B235A] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            New
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div
        ref={ref}
        className={`relative overflow-hidden group border border-transparent bg-transparent hover:bg-white transition-colors duration-500 ease-in-out hover:border-[#F2F2FF] ${getCardClasses()}`}
      >
        <div className="absolute"></div>

        <div className="relative z-[8]">
          <div
            className={`${getVideoContainerClasses()} ${platformType === 'Web App' || platformType === 'Website' ? 'aspect-[3/2]' : ''}`}
            onClick={handleVideoClick}
          >
            {renderVideoContent()}
          </div>

          <div className={getContentPadding()}>
            <div className="flex items-start gap-2">
              {getCategoryImage() && !categoryImageError ? (
                <div className={`bg-white dark:bg-gray-800 border border-[#8787A833] hover:shadow-[6px_0px_24px_-1px_#6D16C321,0px_6px_20px_-1px_#6D16C321] transition-shadow duration-300 overflow-hidden flex-shrink-0 ${getCategoryImageSize()}`}>
                  <Link
                    href={`/browse?apps=${getCategorySlug()}`}
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
                    href={`/browse?apps=${getCategorySlug()}`}
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
                          className={`font-sora ${cardSize === 'large' ? 'text-base' : 'text-sm'
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
