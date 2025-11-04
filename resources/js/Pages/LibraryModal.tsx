import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Copy, Heart, Phone, Link2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { router, Link, usePage, Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import LibraryCard from './LibraryCard';
import MembershipModal from './Website/Components/MembershipModal';
import LibrarySelectionModal from './LibrarySelectionModal';
import BoardModal from '../Components/BoardModal';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    slug?: string;
    image?: string;
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

interface Library {
  id: number;
  title: string;
  slug: string;
  url: string;
  video_url: string;
  description?: string;
  logo?: string;
  seo_title?: string;
  meta_description?: string;
  og_title?: string;
  og_image?: string;
  og_description?: string;
  og_type?: string;
  focus_keyword?: string;
  keywords?: string[];
  canonical_url?: string;
  structured_data?: object;
  platforms: Array<{ id: number; name: string; slug?: string }>;
  categories: Category[];
  industries: Array<{ id: number; name: string; slug?: string }>;
  interactions: Array<{ id: number; name: string; slug?: string }>;
  created_at: string;
  published_date: string;
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

interface Ad {
  id: number;
  title: string;
  image_url: string;
  target_url: string;
}

interface LibraryModalProps extends PageProps {
  library: Library | null;
  isOpen: boolean;
  onClose: () => void;
  onClick: (library: Library) => void;
  allLibraries?: Library[];
  onNavigate?: (library: Library) => void;
  onStarClick?: (library: Library, isStarred: boolean) => void;
  categories?: Category[];
  userPlanLimits?: UserPlanLimits | null;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  filterType?: 'category' | 'industry' | 'interaction' | 'platform';
  filterValue?: string;
  filterName?: string;
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
}

const LibraryModal: React.FC<LibraryModalProps> = ({
  library,
  categories,
  filters,
  filterType,
  filterValue,
  filterName,
  userPlanLimits,
  isOpen,
  onClick,
  onClose,
  allLibraries = [],
  onNavigate,
  auth,
  onStarClick,
  userLibraryIds = [],
  viewedLibraryIds = []
}) => {
  const { url, props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null); // Ref for modal content
  const [linkCopied, setLinkCopied] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLibrarySelectionModal, setShowLibrarySelectionModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [localUserLibraryIds, setLocalUserLibraryIds] = useState<number[]>(userLibraryIds);

  // Modal ad states
  const [modalAd, setModalAd] = useState<Ad | null>(null);
  const [isLoadingModalAd, setIsLoadingModalAd] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalUserLibraryIds(userLibraryIds);
  }, [userLibraryIds]);

  // Check if library is starred based on local state
  const isStarred = library ? localUserLibraryIds.includes(library.id) : false;

  // Function to refresh user library IDs
  const refreshUserLibraryIds = async () => {
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
  };

  // Fetch modal ad for all users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchModalAd();
    }
  }, [isOpen]);

  const fetchModalAd = async () => {
    try {
      setIsLoadingModalAd(true);
      const response = await fetch(`/ads/modal?t=${Date.now()}`);
      const result = await response.json();

      console.log('Modal ad fetch result:', result); // Debug log

      // Check if result is successful AND data exists AND is not null
      if (result.success && result.data && result.data !== null) {
        setModalAd(result.data);
      } else {
        // No active modal ads available
        setModalAd(null);
      }
    } catch (error) {
      console.error('Failed to fetch modal ad:', error);
      setModalAd(null);
    } finally {
      setIsLoadingModalAd(false);
    }
  };

  // Track modal ad click
  const trackModalAdClick = async (adId: number) => {
    try {
      await fetch(`/ads/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
    } catch (error) {
      console.error('Failed to track modal ad click:', error);
    }
  };

  const handleModalAdClick = (ad: Ad) => {
    trackModalAdClick(ad.id);
    window.open(ad.target_url, '_blank');
  };

  // Find current library index for navigation
  const currentIndex = allLibraries.findIndex(lib => lib.id === library?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLibraries.length - 1;

  // Get suggested libraries (next 3 libraries, wrapping around if needed)
  const getSuggestedLibraries = (): Library[] => {
    if (!library || allLibraries.length <= 1) return [];

    const suggestions: Library[] = [];
    const totalLibraries = allLibraries.length;

    for (let i = 1; i <= 6 && suggestions.length < 6; i++) {
      const nextIndex = (currentIndex + i) % totalLibraries;
      if (nextIndex !== currentIndex) {
        suggestions.push(allLibraries[nextIndex]);
      }
    }

    return suggestions;
  };

  const suggestedLibraries = getSuggestedLibraries();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [isOpen, library]);

  // Handle outside click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the backdrop itself, not on the modal content
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    // Handle browser back/forward button
    const handlePopState = (e: PopStateEvent) => {
      if (isOpen) {
        // Check if we're navigating away from the library URL
        if (!window.location.pathname.startsWith('/library/')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // UPDATED: Handle close modal without page reload
  const handleCloseModal = () => {
    // Get the previous URL from history state, or construct a default
    const state = window.history.state;
    const previousUrl = state?.previousUrl || '/';

    // Navigate back to the previous URL
    window.history.pushState({}, '', previousUrl);

    // Call the onClose callback
    onClose();
  };

  // UPDATED: Handle navigation without page reload
  const handlePrevNext = async (direction: 'prev' | 'next') => {
    if (!allLibraries.length || currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev' && hasPrev) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && hasNext) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const newLibrary = allLibraries[newIndex];

    try {
      // Update URL to /library/{slug} without page reload
      const newUrl = `/library/${newLibrary.slug}`;

      // Preserve the original previousUrl (the page before opening any modal)
      const currentState = window.history.state;
      const previousUrl = currentState?.previousUrl || '/';

      window.history.pushState({ fromModal: true, previousUrl: previousUrl }, '', newUrl);

      // Fetch library data
      const response = await fetch(`/api/libraries/${newLibrary.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();

      // Call the navigation callback
      if (onNavigate) {
        onNavigate(data.library);
      }
    } catch (error) {
      console.error('Error navigating to library:', error);

      // Fallback to the old method if API fails
      const libraryUrl = `/library/${newLibrary.slug}`;
      router.visit(libraryUrl, {
        preserveScroll: true,
        preserveState: true,
        only: ['selectedLibrary'],
        onSuccess: () => {
          if (onNavigate) {
            onNavigate(newLibrary);
          }
        }
      });
    }
  };

  const fetchUserBoards = async () => {
    if (isLoadingBoards) return;

    setIsLoadingBoards(true);
    try {
      const response = await fetch(`/api/user-boards?library_id=${library?.id}`);
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

  const isNewLibrary = () => {
    if (!library) return false;
    // Check if library has NOT been viewed yet
    return !viewedLibraryIds.includes(library.id);
  };

  const handleStarClick = async () => {
    if (!library) return;

    if (!authData.user) {
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
    if (onStarClick && library) {
      const newIsStarred = localUserLibraryIds.includes(library.id);
      onStarClick(library, newIsStarred);
    }
  };

  const handleLibraryAdded = async () => {
    // Immediately refresh user library IDs when library is added
    await refreshUserLibraryIds();

    // Notify parent component about the change
    if (onStarClick && library) {
      onStarClick(library, true); // Library was just added, so it's starred
    }
  };

  // UPDATED: Handle copy link with dynamic URL
  const handleCopyLink = async () => {
    if (!library) return;

    try {
      // Get the current URL with the library path
      const currentUrl = window.location.origin + `/library/${library.slug}`;

      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
  };

  // UPDATED: Handle suggested library click without page reload
  const handleSuggestedLibraryClick = async (suggestedLibrary: Library) => {
    try {
      // Update URL to /library/{slug} without page reload
      const newUrl = `/library/${suggestedLibrary.slug}`;

      // Preserve the original previousUrl (the page before opening any modal)
      const currentState = window.history.state;
      const previousUrl = currentState?.previousUrl || '/';

      window.history.pushState({ fromModal: true, previousUrl: previousUrl }, '', newUrl);

      // Fetch library data
      const response = await fetch(`/api/libraries/${suggestedLibrary.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data = await response.json();

      // Call the onClick callback
      if (onClick) {
        onClick(data.library);
      }
    } catch (error) {
      console.error('Error opening suggested library:', error);

      // Fallback to the old method if API fails
      const libraryUrl = `/library/${suggestedLibrary.slug}`;
      router.visit(libraryUrl, {
        preserveScroll: true,
        preserveState: true,
        only: ['selectedLibrary'],
        onSuccess: () => {
          if (onClick) {
            onClick(suggestedLibrary);
          }
        }
      });
    }
  };

  const handleSuggestedLibraryStarClick = (suggestedLibrary: Library, isStarred: boolean) => {
    if (onStarClick) {
      onStarClick(suggestedLibrary, isStarred);
    }
  };

  // Helper functions to get filter slugs from filters array
  const getInteractionSlug = (interactionName: string) => {
    if (!filters?.interactions) return interactionName.toLowerCase().replace(/\s+/g, '-');
    const interaction = filters.interactions.find(i => i.name === interactionName);
    return interaction?.slug || interactionName.toLowerCase().replace(/\s+/g, '-');
  };

  const getIndustrySlug = (industryName: string) => {
    if (!filters?.industries) return industryName.toLowerCase().replace(/\s+/g, '-');
    const industry = filters.industries.find(i => i.name === industryName);
    return industry?.slug || industryName.toLowerCase().replace(/\s+/g, '-');
  };

  const getPlatformSlug = (platformName: string) => {
    if (!filters?.platforms) return platformName.toLowerCase().replace(/\s+/g, '-');
    const platform = filters.platforms.find(p => p.name === platformName);
    return platform?.slug || platformName.toLowerCase().replace(/\s+/g, '-');
  };

  if (!isOpen || !library) return null;

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

  // Use the standardized auth pattern from PageProps
  const isUserAuthenticated = !!authData.user;

return (
    <>
        <Head>
        <title>{library.title}</title>
        <meta name="seo_title" content={library.seo_title || library.title} />
        <meta name="description" content={library.meta_description || library.description || 'Explore this resource on Ripplix.'} />
        <meta property="og:title" content={library.og_title || library.title} />
        <meta property="og:description" content={library.og_description || library.meta_description || library.description || 'Explore this resource on Ripplix.'} />
        {library.og_image && <meta property="og:image" content={library.og_image} />}
        {library.og_type && <meta property="og:type" content={library.og_type} />}
        {library.canonical_url && <link rel="canonical" href={library.canonical_url} />}
        {library.keywords && library.keywords.length > 0 && (
          <meta name="keywords" content={library.keywords.join(', ')} />
        )}
        {library.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(library.structured_data)}
          </script>
        )}

        </Head>
      <div
        className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleBackdropClick}
      >
        <div className="relative max-w-7xl w-full">
          {/* Close Button - Just Outside Modal Right Side */}
          <button
            onClick={handleCloseModal}
            className="absolute -top-6 -right-8 hover:bg-[#e5e5e4] rounded-[4px] p-[2px] dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-500 focus:outline-none z-50"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#89859e] hover:text-[#6e6694] transition-color duration-300 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            ref={modalContentRef}
            className="bg-[#F8F8F9] border border-[#C3C3C9] dark:bg-gray-900 rounded-lg sm:rounded-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto font-sora"
          >
            {/* NEW LAYOUT: Top Header Section */}
            <div className="p-4 sm:p-6 dark:border-gray-800">
              {/* First Row: Category Image/Name (Left) and Prev/Next Buttons (Right) */}
              <div className="flex items-center justify-between mb-4">
                {/* Left: Category Image and Name */}
                <div className="flex items-center space-x-3 flex-1">
                  {getCategoryImage() && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={getCategoryImage()} alt="Category" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {getCategoryName() && (
                      <Link
                        href={`/browse?category=${getCategorySlug()}`}
                        className="font-sora !font-bold"
                      >
                        <h2 className="text-base sm:text-2xl !font-bold text-[#150F32] opacity-85 hover:opacity-100 transition-opacity duration-500 dark:text-white font-sora">
                          {getCategoryName()}
                        </h2>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right: Prev/Next Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePrevNext('prev')}
                    disabled={!hasPrev}
                    className={`p-1 sm:p-1 rounded-lg transition-colors focus:outline-none ${
                      hasPrev
                        ? 'bg-[#E3E2FF] dark:hover:bg-gray-800 border border-[#CECCFF] text-[#2B235A] dark:text-gray-300'
                        : 'text-[#CECCFF] bg-[#F5F5FA] dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handlePrevNext('next')}
                    disabled={!hasNext}
                    className={`p-1 sm:p-1 rounded-lg transition-colors focus:outline-none ${
                      hasNext
                        ? 'bg-[#E3E2FF] dark:hover:bg-gray-800 border border-[#CECCFF] text-[#2B235A] dark:text-gray-300'
                        : 'text-[#CECCFF] bg-[#F5F5FA] dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Second Row: Interactions/Industries/Platforms (Left) and Action Buttons (Right) */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Side: Interactions, Industries, Platforms in same row */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-4">
                    {/* Interactions */}
                    {library.interactions.length > 0 && (
                      <div className="flex-shrink-0">
                        <h3 className="text-xs sm:text-sm text-[#9D9DA8] dark:text-gray-300 mb-2 font-sora">
                          Interactions
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {library.interactions.map((interaction) => (
                            <Link
                              key={interaction.id}
                              href={`/browse?interaction=${getInteractionSlug(interaction.name)}`}
                              className="px-2 sm:px-3 py-1 bg-[#FFFFFF] text-[#443B82] dark:bg-gray-800 dark:text-[#FFFFFF] text-xs sm:text-xs rounded-[4px] border border-[#E3E2FF] font-sora hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                            >
                              {interaction.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Industries */}
                    {library.industries.length > 0 && (
                      <div className="flex-shrink-0">
                        <h3 className="text-xs sm:text-sm text-[#9D9DA8] dark:text-gray-300 mb-2 font-sora">
                          Industries
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {library.industries.map((industry) => (
                            <Link
                              key={industry.id}
                              href={`/browse?industry=${getIndustrySlug(industry.name)}`}
                              className="px-2 sm:px-3 py-1 bg-[#FFFFFF] text-[#443B82] dark:bg-gray-800 dark:text-[#FFFFFF] text-xs sm:text-xs rounded-[4px] border border-[#E3E2FF] font-sora hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                            >
                              {industry.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Platforms */}
                    {library.platforms.length > 0 && (
                      <div className="flex-shrink-0">
                        <h3 className="text-xs sm:text-sm text-[#9D9DA8] dark:text-gray-300 mb-2 font-sora">
                          Platforms
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {library.platforms.map((platform) => (
                            <Link
                              key={platform.id}
                              href={`/browse?platform=${getPlatformSlug(platform.name)}`}
                              className="px-2 sm:px-3 py-1 bg-[#FFFFFF] text-[#443B82] dark:bg-gray-800 dark:text-[#FFFFFF] text-xs sm:text-xs rounded-[4px] border border-[#E3E2FF] font-sora hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                            >
                              {platform.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Action Buttons in One Row */}
                <div className="flex gap-2 lg:items-start lg:min-w-[380px]">
                  <button
                    onClick={handleStarClick}
                    disabled={isLoadingBoards}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-colors focus:outline-none text-xs sm:text-sm font-semibold disabled:opacity-50 ${
                      isUserAuthenticated
                        ? 'border border-[#CECCFF] dark:bg-gray-800 text-[#2B235A] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'border border-[#CECCFF] dark:bg-gray-800 text-[#2B235A] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                      <span>
                      <Star
                      className="w-4 h-4 sm:w-4 sm:h-4"
                      fill={isStarred ? '#2B235A' : 'none'}
                      color={isStarred ? '#2B235A' : 'currentColor'}
                    />
                      </span>

                    <span>Add to Collection</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus:outline-none text-xs sm:text-sm font-sora font-semibold"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="font-sora w-4 h-4 sm:w-4 sm:h-4 z-10" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="font-sora w-4 h-4 sm:w-4 sm:h-4 z-10" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Section - Full Width */}
            <div className="w-full px-4 bg-[#F8F8F9] dark:bg-gray-800 relative">
              {isNewLibrary() && (
                <div className="absolute top-6 right-7 bg-[#2B235A] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide z-10">
                  New
                </div>
              )}
              <video
                ref={videoRef}
                src={library.video_url}
                className="w-full h-full object-cover rounded-xl"
                autoPlay
                muted
                loop
                playsInline
                style={{ minHeight: '400px', maxHeight: '700px'}}
              />
            </div>

            {/* Bottom Section - Ad and Suggested Libraries */}
            <div className="p-4 sm:p-6">
              {/* Advertisement Section - Shows for all users */}
              <div className="w-full mb-6">
                {isLoadingModalAd ? (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="w-3/4 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ) : modalAd ? (
                  <button
                    onClick={() => handleModalAdClick(modalAd)}
                    className="w-full block hover:opacity-90 transition-opacity focus:outline-none outline-none rounded-lg"
                  >
                    <img
                      src={modalAd.image_url}
                      alt={modalAd.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </button>
                ) : (
                  <div className="w-full h-48 bg-[#FAF9F6] dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-[#E0DAC8] dark:border-orange-800 flex items-center justify-center">
                    <div className="text-center pb-2">
                      <div className="w-10 h-10 bg-white dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-[12px]">
                        <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg !font-bold text-gray-900 dark:text-white mb-2 font-sora">
                        Want to advertise here?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-sora !font-semibold">
                        Reach thousands of design enthusiasts and professionals
                      </p>
                      <Link
                        href="/contact-us"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-[#333333] hover:bg-black text-white rounded-lg transition-colors font-sora !font-semibold focus:outline-none outline-none"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Us</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Libraries Section - Shows for all users */}
              {suggestedLibraries.length > 0 && (
                <>
                  <h3 className="text-lg sm:font-bold font-bold sm:text-xl text-[#2E241C] dark:text-white mb-3 sm:mb-4">
                    You might also like
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {suggestedLibraries.map((suggestedLibrary) => (
                      <LibraryCard
                        ziggy={ziggyData}
                        key={suggestedLibrary.id}
                        library={suggestedLibrary}
                        onClick={handleSuggestedLibraryClick}
                        cardSize="normal"
                        auth={authData}
                        userLibraryIds={localUserLibraryIds}
                        viewedLibraryIds={viewedLibraryIds}
                        userPlanLimits={userPlanLimits}
                        onStarClick={handleSuggestedLibraryStarClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Modal */}
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

export default LibraryModal;
