import React from 'react';
import { MoreVertical, Share2, Edit2, Trash2, Link as LinkIcon, Crown, Lock, Infinity, Atom, FolderOpen } from 'lucide-react';
import { router, Link } from '@inertiajs/react';

interface Category {
  id: number;
  name: string;
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
  platforms: Array<{ id: number; name: string }>;
  categories: Category[];
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
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
  libraries_count?: number;
  libraries?: Library[];
  is_blurred?: boolean;
  creator_name?: string;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  userPlanLimits?: UserPlanLimits | null;
  isBlurred?: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onEdit,
  onDelete,
  userPlanLimits,
  isBlurred = false
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const openDeleteModal = () => {
    onDelete(board);
    setShowMenu(false);
  };

  const copyShareLink = () => {
    if (board.share_url && userPlanLimits?.canShare) {
      navigator.clipboard.writeText(board.share_url);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setShowMenu(false);
  };

  const getLibraryVideos = () => {
    if (!board.libraries || board.libraries.length === 0) return [];
    return board.libraries
      .filter(library => library.video_url)
      .slice(0, 3)
      .map(library => library.video_url);
  };

  const libraryVideos = getLibraryVideos();
  const libraryCount = board.libraries_count || 0;
  const isFreePlan = userPlanLimits?.isFree ?? false;
  const canShare = userPlanLimits?.canShare ?? true;
  const showMenuButton = !isBlurred;

  return (
    <div className={`w-full font-sora bg-white rounded-lg border border-[#E3E2FF] overflow-hidden focus:outline-none focus:ring-0 relative ${
      isBlurred ? 'opacity-60' : ''
    }`}>
      {showMenuButton && (
        <div className="absolute top-3 sm:top-4 md:top-3.5 right-3 sm:right-4 md:right-3.5 z-10 focus:outline-none focus:ring-0">
          <button
            onClick={handleMenuClick}
            className="p-1 text-[#2B235A] font-semibold opacity-80 hover:opacity-100 bg-[#F5F5FA] border border-[#E3E2FF] rounded transition-all outline-none focus:outline-none focus:ring-0"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
          </button>

          {showMenu && (
            <>
              <div className="absolute right-0 mt-2 w-44 sm:w-48 md:w-46 bg-[#F5F5FA] border border-[#E3E2FF] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none focus:ring-0 font-sora">
                <div className="py-1 px-1">
                  <button
                    onClick={(e) => handleMenuItemClick(e, () => onEdit(board))}
                    className="flex items-center px-3 sm:px-4 md:px-3.5 py-2 text-sm sm:text-base md:text-[15px] text-[#2B235A] hover:bg-white w-full text-left rounded-md focus:outline-none focus:ring-0"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                    Edit
                  </button>

                  {board.share_url && canShare ? (
                    <button
                      onClick={(e) => handleMenuItemClick(e, copyShareLink)}
                      className="flex items-center px-3 sm:px-4 md:px-3.5 py-2 text-sm sm:text-base md:text-[15px] text-[#2B235A] hover:bg-white w-full text-left rounded-md focus:outline-none focus:ring-0"
                    >
                      <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                      Copy Share Link
                    </button>
                  ) : board.share_url && !canShare ? (
                    <div className="flex items-center px-3 sm:px-4 md:px-3.5 py-2 text-sm sm:text-base md:text-[15px] text-gray-400 w-full">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                      <span>Share Link</span>
                      <Crown className="w-3 h-3 ml-auto text-[#9943EE] fill-current" />
                    </div>
                  ) : null}

                  <button
                    onClick={(e) => handleMenuItemClick(e, openDeleteModal)}
                    className="flex items-center px-3 sm:px-4 md:px-3.5 py-2 text-sm sm:text-base md:text-[15px] text-red-600 hover:bg-[#E3E2FF] w-full text-left rounded-md focus:outline-none focus:ring-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 mr-2" />
                    Delete
                  </button>
                </div>
              </div>

              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
            </>
          )}
        </div>
      )}

      {isFreePlan && !isBlurred && (
        <div className="absolute top-3 sm:top-4 md:top-3.5 left-3 sm:left-4 md:left-3.5 z-10">
          <div className="flex items-center gap-1 px-1.5 sm:px-2 md:px-1.5 py-0.5 sm:py-1 bg-[#EEE4FF] border border-[#CDA0FA] rounded-full text-[10px] sm:text-xs md:text-[11px]">
            <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-2.5 md:h-2.5 text-[#9943EE] fill-current" />
            <span className="text-[#2B235A] font-medium">
              {libraryCount}/{userPlanLimits?.maxLibrariesPerBoard}
            </span>
          </div>
        </div>
      )}

      <Link href={`/boards/${board.id}`} className="block focus:outline-none focus:ring-0">
        {/* Stacked Video Section */}
        <div className="px-4 pt-12 pb-4 sm:px-5 sm:pt-14 sm:pb-5 lg:px-6 lg:pt-16 lg:pb-6">
          <div className="relative w-full" style={{
            paddingTop: '60%',
            marginTop: '4rem'
          }}>
            {libraryVideos.length > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full" style={{
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}>
                  {libraryVideos.map((videoUrl, index) => {
                    const scale = 1 - (index * 0.08);
                    const offsetY = -index * 2;
                    const zIndex = libraryVideos.length - index;

                    return (
                      <div
                        key={index}
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_-2px_3px_-1px_rgba(0,0,0,0.08),0_-1px_2px_-1px_rgba(0,0,0,0.05)] bg-white"
                        style={{
                          transform: `scale(${scale}) translateY(${offsetY}rem)`,
                          transformOrigin: 'center top',
                          zIndex: zIndex,
                          transition: 'transform 300ms ease-in-out'
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
              </div>
            ) : (
              <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-[#F5F5FA]">
                <FolderOpen className="w-8 h-8 text-[#CECCFF]" />
              </div>
            )}
          </div>
        </div>

        {/* Board Info Section */}
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#2B235A] text-base sm:text-lg md:text-[17px] truncate mb-1">
                {board.name}
              </h3>
              <p className="text-xs sm:text-sm md:text-[13px] text-[#62626C]">
                {libraryCount <= 9 ? '0' : ''}{libraryCount} Animation{libraryCount !== 1 ? 's' : ''}
              </p>
            </div>

            {isFreePlan && !isBlurred && (board.share_via_link || board.share_via_email) && (
              <div className="ml-2 flex items-center gap-1 text-[#9943EE] fill flex-shrink-0" title="Sharing disabled on free plan">
                {/* Placeholder for future icons if needed */}
              </div>
            )}
          </div>

          {isFreePlan && !isBlurred && libraryCount >= (userPlanLimits?.maxLibrariesPerBoard || 0) && (
            <div className="mt-2 text-[10px] sm:text-xs md:text-[11px] text-[#2B235A] bg-[#EEE4FF] px-2 py-2 rounded">
              Maximum Interaction limit reached • Upgrade for more
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default BoardCard;
