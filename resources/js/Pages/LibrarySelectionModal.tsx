import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Minus, Crown, SwatchBook } from 'lucide-react';
import SubscriptionPricingModal from './SubscriptionPricingModal';
// import PricingModal from '@/Pages/PricingModal';

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
  can_add_library?: boolean;
  library_count?: number;
  max_libraries?: number;
  is_free_plan?: boolean;
}

interface Library {
  id: number;
  title: string;
  slug: string;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface LibrarySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: Library;
  boards: Board[];
  onCreateBoard: () => void;
  isLoading?: boolean;
  onLibraryAdded?: () => void;
  userPlanLimits?: UserPlanLimits | null;
}

const LibrarySelectionModal: React.FC<LibrarySelectionModalProps> = ({
  isOpen,
  onClose,
  library,
  boards,
  onCreateBoard,
  isLoading = false,
  onLibraryAdded,
  userPlanLimits,
}) => {
  const [boardsToAdd, setBoardsToAdd] = useState<Set<number>>(new Set());
  const [boardsToRemove, setBoardsToRemove] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Reset state when modal opens/closes or boards change
  useEffect(() => {
    if (isOpen) {
      setBoardsToAdd(new Set());
      setBoardsToRemove(new Set());
      setSuccessMessage('');
      setErrorMessage('');
      setShowUpgradeMessage(false);
    }
  }, [isOpen, boards]);

  // Check if user can create more boards
  const canCreateMoreBoards = () => {
    if (!userPlanLimits?.isFree) return true;
    return boards.length < userPlanLimits.maxBoards;
  };

  // Separate boards into visible and blurred based on plan limits
  const visibleBoards = userPlanLimits?.isFree
    ? boards.slice(0, userPlanLimits.maxBoards)
    : boards;

  const blurredBoards = userPlanLimits?.isFree
    ? boards.slice(userPlanLimits.maxBoards)
    : [];

  const handleBoardToggle = (boardId: number, currentlyHasLibrary: boolean) => {
    const board = boards.find(b => b.id === boardId);

    // Check if board can accept more libraries (for free plans)
    if (!currentlyHasLibrary && board && !board.can_add_library) {
      setShowUpgradeMessage(true);
      setErrorMessage(`This board has reached the limit of ${board.max_libraries} interactions for ${userPlanLimits?.planName || 'your'} plan. Upgrade to add more.`);
      setTimeout(() => {
        setShowUpgradeMessage(false);
        setErrorMessage('');
      }, 5000);
      return;
    }

    const newBoardsToAdd = new Set(boardsToAdd);
    const newBoardsToRemove = new Set(boardsToRemove);

    if (currentlyHasLibrary) {
      // Board currently has library
      if (newBoardsToRemove.has(boardId)) {
        // Currently marked for removal, so unmark it (keep library)
        newBoardsToRemove.delete(boardId);
      } else {
        // Mark for removal
        newBoardsToRemove.add(boardId);
        // Remove from add set if it was there
        newBoardsToAdd.delete(boardId);
      }
    } else {
      // Board doesn't have library
      if (newBoardsToAdd.has(boardId)) {
        // Currently marked for addition, so unmark it
        newBoardsToAdd.delete(boardId);
      } else {
        // Mark for addition
        newBoardsToAdd.add(boardId);
        // Remove from remove set if it was there
        newBoardsToRemove.delete(boardId);
      }
    }

    setBoardsToAdd(newBoardsToAdd);
    setBoardsToRemove(newBoardsToRemove);
  };

  const handleBlurredBoardClick = () => {
    setIsPricingModalOpen(true);
  };

  const getBoardStatus = (boardId: number, hasLibrary: boolean) => {
    if (hasLibrary) {
      if (boardsToRemove.has(boardId)) {
        return 'removing';
      }
      return 'has';
    } else {
      if (boardsToAdd.has(boardId)) {
        return 'adding';
      }
      return 'empty';
    }
  };

  const getActionText = () => {
    const addCount = boardsToAdd.size;
    const removeCount = boardsToRemove.size;

    if (addCount === 0 && removeCount === 0) {
      return 'Select boards';
    }

    const actions = [];
    if (addCount > 0) {
      actions.push(`Save to Board`);
    }
    if (removeCount > 0) {
      actions.push(`Remove from Board`);
    }

    return actions.join(' & ');
  };

  const handleSave = async () => {
    if (boardsToAdd.size === 0 && boardsToRemove.size === 0) {
      onClose();
      return;
    }

    setProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/boards/add-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          library_id: library.id,
          board_ids_to_add: Array.from(boardsToAdd),
          board_ids_to_remove: Array.from(boardsToRemove),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));

        // Handle plan limit error
        if (errorData.error === 'plan_limit') {
          setShowUpgradeMessage(true);
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Changes saved successfully!');
        setBoardsToAdd(new Set());
        setBoardsToRemove(new Set());

        if (onLibraryAdded) {
          onLibraryAdded();
        }

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while saving changes');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateBoard = () => {
    // Check board limit before creating
    if (!canCreateMoreBoards()) {
      setIsPricingModalOpen(true);
      return;
    }
    onCreateBoard();
  };

  const handlePricingModalClose = () => {
    setIsPricingModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sora">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md" onClick={onClose} />

        <div className="relative w-full max-w-[550px] py-6 px-10 bg-white shadow-xl rounded-lg z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[32px] font-sora !font-semibold text-[#2B235A]">
                Manage Collection
              </h3>
              {/* Show board count badge for free users */}
              {userPlanLimits?.isFree && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#EEE4FF] border border-[#CDA0FA] rounded-full text-xs">
                  <Crown className="w-3 h-3 text-[#9943EE] fill-current" />
                  <span className="text-[#2B235A] font-medium">
                    {visibleBoards.length}/{userPlanLimits.maxBoards}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#2B235A] opacity-85 hover:opacity-100 transition-opacity duration-500 focus:outline-none focus:ring-0 bg-[#F7F7FC] p-1"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="mb-10 ">
            <p className="text-sm text-[#474750]">
              Add or remove "<span className='font-bold text-[#2B235A]'>{library.title}</span>" from your boards
            </p>
          </div>

          {/* Library Limit Warning */}
          {userPlanLimits?.isFree && showUpgradeMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Crown className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    Upgrade to add more interactions
                  </h4>
                  <p className="text-xs text-amber-700">
                    {userPlanLimits.planName} plan allows {userPlanLimits.maxLibrariesPerBoard} interactions per board.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-[#F5F5FA] border border-[#CECCFF] text-[#2B235A] rounded">
              {successMessage}
            </div>
          )}

          {errorMessage && !showUpgradeMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {/* Create New Board Button */}
          <button
            onClick={handleCreateBoard}
            disabled={processing}
            className="w-full mb-10 p-3 border-[2px] border-dashed border-[#BCBDC8] rounded-lg opacity-85 transition-opacity hover:opacity-100 group disabled:opacity-50 focus:outline-none focus:ring-0"
          >
            <div className="flex items-center justify-center text-[#2B235A] group-hover:opacity-100 transition-opacity duration-500">
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">Create New Board</span>
            </div>
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#564638] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading boards...</p>
            </div>
          )}

          {/* Boards Grid */}
          {!isLoading && (
            <div className="max-h-60 overflow-y-auto">
              {boards.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Render visible/accessible boards */}
                  {visibleBoards.map((board) => {
                    const hasLibrary = board.has_library || false;
                    const status = getBoardStatus(board.id, hasLibrary);
                    const isLocked = !hasLibrary && !board.can_add_library;

                    // Determine styling based on status
                    let borderColor = 'border-[#E3E2FF]';
                    let bgColor = 'bg-[#F7F7FC]';

                    // Override styles if board is locked
                    if (isLocked) {
                      borderColor = 'border-amber-200';
                      bgColor = 'bg-amber-50';
                    } else {
                      // Apply status-based styling for unlocked boards
                      switch (status) {
                        case 'has':
                        case 'adding':
                          borderColor = 'border-[#B7B3FF]';
                          bgColor = 'bg-[#F2EDFF]';
                          break;
                        case 'removing':
                          borderColor = 'border-red-400';
                          bgColor = 'bg-red-50';
                          break;
                        default:
                          borderColor = 'border-[#E3E2FF]';
                          bgColor = 'bg-[#F7F7FC]';
                      }
                    }

                    return (
                      <div
                        key={board.id}
                        onClick={() => !isLocked && handleBoardToggle(board.id, hasLibrary)}
                        className={`aspect-square w-full p-3 border rounded-lg ${borderColor} ${bgColor} ${
                          isLocked ? 'cursor-not-allowed opacity-60' : 'hover:border-gray-300 cursor-pointer'
                        } transition-colors flex flex-col justify-center items-center relative`}
                      >
                        {/* Top right corner - checkmark for selected states */}
                        <div className="absolute top-2 right-2">
                          {!isLocked && (status === 'has' || status === 'adding') && (
                            <div className="w-5 h-5 rounded-full bg-[#5725D8] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {!isLocked && status === 'removing' && (
                            <Minus className="w-4 h-4 text-red-600" />
                          )}
                          {isLocked && (
                            <Crown className="w-4 h-4 text-amber-600 fill-current" />
                          )}
                        </div>

                        {/* Center content - icon and board name */}
                        <div className="flex flex-col items-center justify-center text-center px-2 w-full">
                          <SwatchBook className={`w-6 h-6 mb-2 ${isLocked ? 'text-amber-600' : 'text-[#5E54AB]'}`} />
                          <span className="text-sm font-medium text-[#2B235A] line-clamp-2 break-words leading-tight">
                            {board.name}
                          </span>
                          {/* Show library count for locked boards */}
                          {isLocked && (
                            <span className="text-xs text-amber-700 mt-1 block">
                              {board.library_count}/{board.max_libraries}
                            </span>
                          )}
                        </div>

                        {/* Locked badge */}
                        {isLocked && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                              Full
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Render blurred boards for free users */}
                  {blurredBoards.map((board) => {
                    return (
                      <div
                        key={`blurred-${board.id}`}
                        onClick={handleBlurredBoardClick}
                        className="aspect-square w-full p-3 border-2 border-[#CDA0FA] rounded-lg bg-[#EEE4FF] cursor-pointer hover:opacity-90 transition-opacity duration-500 flex flex-col justify-center items-center relative group"
                      >
                        {/* Blur overlay */}
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/40 rounded-lg flex items-center justify-center z-10 group-hover:bg-white/50 transition-colors">
                          <Crown className="w-6 h-6 text-[#9943EE] fill-current" />
                        </div>

                        {/* Center content (blurred) */}
                        <div className="flex flex-col items-center justify-center text-center px-2 w-full blur-sm">
                          <SwatchBook className="w-6 h-6 mb-2 text-[]" />
                          <span className="text-sm font-medium text-gray-900 line-clamp-2 break-words leading-tight">
                            {board.name}
                          </span>
                        </div>

                        {/* Pro badge */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20">
                          <span className="px-2 py-0.5 text-xs rounded-full text-[#2B235A] border border-[#CDA0FA] font-medium">
                            Upgrade
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SwatchBook className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No boards yet</p>
                  <p className="text-xs text-gray-500">Create your first board to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Show upgrade prompt if there are blurred boards */}
          {blurredBoards.length > 0 && (
            <div className="mt-4 py-3 px-5 bg-[#EEE4FF] shadow-[0px_8px_16px_0px_#E4D0FE40] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">

                  <div>
                    <p className="text-sm font-medium text-[#2B235A]">
                      {blurredBoards.length} more board{blurredBoards.length !== 1 ? 's' : ''} available
                    </p>
                    <p className="text-xs text-[#817399]">
                      Upgrade to Pro to access all your boards
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="px-3 py-2 holographic-link2 bg-[#784AEF] text-white text-xs font-medium rounded hover:opacity-90 transition-opacity duration-500 focus:outline-none focus:ring-0"
                >
                    <span className='z-10'>
                        Upgrade
                    </span>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 mt-10 [box-shadow:0px_-2px_8px_-4px_#0000000A,0px_-6px_16px_-3px_#00000005]">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-[#2B235A] bg-white border border-[#CECCFF] rounded-md hover:bg-gray-50 transition-color duration-500 focus:outline-none focus:ring-0 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing || (boardsToAdd.size === 0 && boardsToRemove.size === 0) || isLoading}
              className="px-4 py-2 text-sm font-medium text-white holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] border border-transparent rounded-md hover:opacity-90 focus:outline-none focus:ring-0 disabled:opacity-80 transition-opacity"
            >
                <span>
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                getActionText()
              )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <SubscriptionPricingModal
        isOpen={isPricingModalOpen}
        onClose={handlePricingModalClose}
        isAuthenticated={true}
      />
    </>
  );
};

export default LibrarySelectionModal;




// import React, { useState, useEffect } from 'react';
// import { X, Plus, Check, Folder, Minus, Crown, Lock } from 'lucide-react';
// import PricingModal from '@/Pages/PricingModal';

// interface Board {
//   id: number;
//   name: string;
//   creator_email: string;
//   share_via_link: boolean;
//   share_via_email: boolean;
//   share_emails?: string[];
//   share_url?: string | null;
//   created_at: string;
//   has_library?: boolean;
//   can_add_library?: boolean;
//   library_count?: number;
//   max_libraries?: number;
//   is_free_plan?: boolean;
// }

// interface Library {
//   id: number;
//   title: string;
//   slug: string;
// }

// interface UserPlanLimits {
//   isFree: boolean;
//   maxBoards: number;
//   maxLibrariesPerBoard: number;
//   canShare: boolean;
//   planName: string;
//   planSlug: string;
// }

// interface LibrarySelectionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   library: Library;
//   boards: Board[];
//   onCreateBoard: () => void;
//   isLoading?: boolean;
//   onLibraryAdded?: () => void;
//   userPlanLimits?: UserPlanLimits | null;
// }

// const LibrarySelectionModal: React.FC<LibrarySelectionModalProps> = ({
//   isOpen,
//   onClose,
//   library,
//   boards,
//   onCreateBoard,
//   isLoading = false,
//   onLibraryAdded,
//   userPlanLimits,
// }) => {
//   const [boardsToAdd, setBoardsToAdd] = useState<Set<number>>(new Set());
//   const [boardsToRemove, setBoardsToRemove] = useState<Set<number>>(new Set());
//   const [processing, setProcessing] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
//   const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

//   // Reset state when modal opens/closes or boards change
//   useEffect(() => {
//     if (isOpen) {
//       setBoardsToAdd(new Set());
//       setBoardsToRemove(new Set());
//       setSuccessMessage('');
//       setErrorMessage('');
//       setShowUpgradeMessage(false);
//     }
//   }, [isOpen, boards]);

//   // Check if user can create more boards
//   const canCreateMoreBoards = () => {
//     if (!userPlanLimits?.isFree) return true;
//     return boards.length < userPlanLimits.maxBoards;
//   };

//   // Separate boards into visible and blurred based on plan limits
//   const visibleBoards = userPlanLimits?.isFree
//     ? boards.slice(0, userPlanLimits.maxBoards)
//     : boards;

//   const blurredBoards = userPlanLimits?.isFree
//     ? boards.slice(userPlanLimits.maxBoards)
//     : [];

//   const handleBoardToggle = (boardId: number, currentlyHasLibrary: boolean) => {
//     const board = boards.find(b => b.id === boardId);

//     // Check if board can accept more libraries (for free plans)
//     if (!currentlyHasLibrary && board && !board.can_add_library) {
//       setShowUpgradeMessage(true);
//       setErrorMessage(`This board has reached the limit of ${board.max_libraries} interactions for ${userPlanLimits?.planName || 'your'} plan. Upgrade to add more.`);
//       setTimeout(() => {
//         setShowUpgradeMessage(false);
//         setErrorMessage('');
//       }, 5000);
//       return;
//     }

//     const newBoardsToAdd = new Set(boardsToAdd);
//     const newBoardsToRemove = new Set(boardsToRemove);

//     if (currentlyHasLibrary) {
//       // Board currently has library
//       if (newBoardsToRemove.has(boardId)) {
//         // Currently marked for removal, so unmark it (keep library)
//         newBoardsToRemove.delete(boardId);
//       } else {
//         // Mark for removal
//         newBoardsToRemove.add(boardId);
//         // Remove from add set if it was there
//         newBoardsToAdd.delete(boardId);
//       }
//     } else {
//       // Board doesn't have library
//       if (newBoardsToAdd.has(boardId)) {
//         // Currently marked for addition, so unmark it
//         newBoardsToAdd.delete(boardId);
//       } else {
//         // Mark for addition
//         newBoardsToAdd.add(boardId);
//         // Remove from remove set if it was there
//         newBoardsToRemove.delete(boardId);
//       }
//     }

//     setBoardsToAdd(newBoardsToAdd);
//     setBoardsToRemove(newBoardsToRemove);
//   };

//   const handleBlurredBoardClick = () => {
//     setIsPricingModalOpen(true);
//   };

//   const getBoardStatus = (boardId: number, hasLibrary: boolean) => {
//     if (hasLibrary) {
//       if (boardsToRemove.has(boardId)) {
//         return 'removing';
//       }
//       return 'has';
//     } else {
//       if (boardsToAdd.has(boardId)) {
//         return 'adding';
//       }
//       return 'empty';
//     }
//   };

//   const getActionText = () => {
//     const addCount = boardsToAdd.size;
//     const removeCount = boardsToRemove.size;

//     if (addCount === 0 && removeCount === 0) {
//       return 'Select boards';
//     }

//     const actions = [];
//     if (addCount > 0) {
//       actions.push(`Add to Board`);
//     }
//     if (removeCount > 0) {
//       actions.push(`Remove from Board`);
//     }

//     return actions.join(' & ');
//   };

//   const handleSave = async () => {
//     if (boardsToAdd.size === 0 && boardsToRemove.size === 0) {
//       onClose();
//       return;
//     }

//     setProcessing(true);
//     setErrorMessage('');
//     setSuccessMessage('');

//     try {
//       const response = await fetch('/boards/add-library', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
//         },
//         body: JSON.stringify({
//           library_id: library.id,
//           board_ids_to_add: Array.from(boardsToAdd),
//           board_ids_to_remove: Array.from(boardsToRemove),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));

//         // Handle plan limit error
//         if (errorData.error === 'plan_limit') {
//           setShowUpgradeMessage(true);
//         }

//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setSuccessMessage(data.message || 'Changes saved successfully!');
//         setBoardsToAdd(new Set());
//         setBoardsToRemove(new Set());

//         if (onLibraryAdded) {
//           onLibraryAdded();
//         }

//         setTimeout(() => {
//           onClose();
//         }, 1500);
//       } else {
//         throw new Error(data.message || 'Failed to save changes');
//       }
//     } catch (error) {
//       console.error('Error saving changes:', error);
//       setErrorMessage(error instanceof Error ? error.message : 'An error occurred while saving changes');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleCreateBoard = () => {
//     // Check board limit before creating
//     if (!canCreateMoreBoards()) {
//       setIsPricingModalOpen(true);
//       return;
//     }
//     onCreateBoard();
//   };

//   const handlePricingModalClose = () => {
//     setIsPricingModalOpen(false);
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sora">
//         <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md" onClick={onClose} />

//         <div className="relative w-full max-w-[550px] py-6 px-10 bg-white shadow-xl rounded-lg z-10">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <h3 className="text-[32px] font-sora !font-semibold text-[#2B235A]">
//                 Manage Collection
//               </h3>
//               {/* Show board count badge for free users */}
//               {userPlanLimits?.isFree && (
//                 <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs">
//                   <Crown className="w-3 h-3 text-amber-600" />
//                   <span className="text-amber-700 font-medium">
//                     {visibleBoards.length}/{userPlanLimits.maxBoards}
//                   </span>
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={onClose}
//               className="text-[#2B235A] opacity-85 hover:opacity-100 transition-opacity duration-500 focus:outline-none focus:ring-0 bg-[#F7F7FC] p-1"
//             >
//               <X className="w-7 h-7" />
//             </button>
//           </div>

//           <div className="mb-10 ">
//             <p className="text-sm text-[#474750]">
//               Add or remove "<span className='font-bold text-[#2B235A]'>{library.title}</span>" from your boards
//             </p>
//           </div>

//           {/* Library Limit Warning */}
//           {userPlanLimits?.isFree && showUpgradeMessage && (
//             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
//               <div className="flex items-start">
//                 <Crown className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-medium text-amber-800 mb-1">
//                     Upgrade to add more interactions
//                   </h4>
//                   <p className="text-xs text-amber-700">
//                     {userPlanLimits.planName} plan allows {userPlanLimits.maxLibrariesPerBoard} interactions per board.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Success/Error Messages */}
//           {successMessage && (
//             <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
//               {successMessage}
//             </div>
//           )}

//           {errorMessage && !showUpgradeMessage && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//               {errorMessage}
//             </div>
//           )}

//           {/* Create New Board Button */}
//           <button
//             onClick={handleCreateBoard}
//             disabled={processing}
//             className="w-full mb-10 p-3 border-[2px] border-dashed border-[#BCBDC8] rounded-lg opacity-85 transition-opacity hover:opacity-100 group disabled:opacity-50 focus:outline-none focus:ring-0"
//           >
//             <div className="flex items-center justify-center text-[#2B235A] group-hover:opacity-100 transition-opacity duration-500">
//               <Plus className="w-5 h-5 mr-2" />
//               <span className="text-lg font-bold">Create New Board</span>
//             </div>
//           </button>

//           {/* Loading State */}
//           {isLoading && (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#564638] mx-auto mb-2"></div>
//               <p className="text-sm text-gray-600">Loading boards...</p>
//             </div>
//           )}

//           {/* Boards Grid */}
//           {!isLoading && (
//             <div className="max-h-60 overflow-y-auto">
//               {boards.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {/* Render visible/accessible boards */}
//                   {visibleBoards.map((board) => {
//                     const hasLibrary = board.has_library || false;
//                     const status = getBoardStatus(board.id, hasLibrary);
//                     const isLocked = !hasLibrary && !board.can_add_library;

//                     // Determine styling based on status
//                     let borderColor = 'border-[#E3E2FF]';
//                     let bgColor = 'bg-[#F7F7FC]';
//                     let badgeColor = '';
//                     let badgeText = '';
//                     let showIcon = null;

//                     // Override styles if board is locked
//                     if (isLocked) {
//                       borderColor = 'border-amber-200';
//                       bgColor = 'bg-amber-50';
//                     }

//                     switch (status) {
//                       case 'has':
//                         if (!isLocked) {
//                           borderColor = 'border-green-400';
//                           bgColor = 'bg-green-50';
//                           badgeColor = 'bg-green-100 text-green-800';
//                           badgeText = 'Added';
//                           showIcon = <Check className="w-4 h-4 text-green-600" />;
//                         }
//                         break;
//                       case 'adding':
//                         if (!isLocked) {
//                           borderColor = 'border-blue-400';
//                           bgColor = 'bg-blue-50';
//                           badgeColor = 'bg-blue-100 text-blue-800';
//                           badgeText = 'Adding';
//                           showIcon = <Plus className="w-4 h-4 text-blue-600" />;
//                         }
//                         break;
//                       case 'removing':
//                         if (!isLocked) {
//                           borderColor = 'border-red-400';
//                           bgColor = 'bg-red-50';
//                           badgeColor = 'bg-red-100 text-red-800';
//                           badgeText = 'Removing';
//                           showIcon = <Minus className="w-4 h-4 text-red-600" />;
//                         }
//                         break;
//                       default:
//                         borderColor = 'border-[#E0DAC8]';
//                         bgColor = 'bg-[#FAF9F6]';
//                     }

//                     return (
//                       <div
//                         key={board.id}
//                         onClick={() => !isLocked && handleBoardToggle(board.id, hasLibrary)}
//                         className={`aspect-square w-24 h-24 sm:w-28 sm:h-28 p-3 border rounded-lg ${borderColor} ${bgColor} ${
//                           isLocked ? 'cursor-not-allowed opacity-60' : 'hover:border-gray-300 cursor-pointer'
//                         } transition-colors flex flex-col justify-center items-center relative`}
//                       >
//                         {/* Top corner elements */}
//                         <div className="absolute top-2 left-2">
//                           <Folder className={`w-4 h-4 ${isLocked ? 'text-amber-600' : 'text-[#564638]'}`} />
//                         </div>

//                         <div className="absolute top-2 right-2">
//                           {isLocked ? (
//                             <Crown className="w-4 h-4 text-amber-600" />
//                           ) : (
//                             showIcon
//                           )}
//                         </div>

//                         {/* Center content */}
//                         <div className="text-center px-2">
//                           <span className="text-sm font-medium text-gray-900 line-clamp-2 break-words leading-tight">
//                             {board.name}
//                           </span>
//                           {/* Show library count for locked boards */}
//                           {isLocked && (
//                             <span className="text-xs text-amber-700 mt-1 block">
//                               {board.library_count}/{board.max_libraries}
//                             </span>
//                           )}
//                         </div>

//                         {/* Status badge at bottom */}
//                         {badgeText && !isLocked && (
//                           <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
//                             <span className={`px-2 py-0.5 text-xs rounded-full ${badgeColor}`}>
//                               {badgeText}
//                             </span>
//                           </div>
//                         )}

//                         {/* Locked badge */}
//                         {isLocked && (
//                           <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
//                             <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
//                               Full
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}

//                   {/* Render blurred boards for free users */}
//                   {blurredBoards.map((board) => {
//                     return (
//                       <div
//                         key={`blurred-${board.id}`}
//                         onClick={handleBlurredBoardClick}
//                         className="aspect-square w-24 h-24 sm:w-28 sm:h-28 p-3 border-2 border-amber-300 rounded-lg bg-amber-50 cursor-pointer hover:border-amber-400 transition-colors flex flex-col justify-center items-center relative group"
//                       >
//                         {/* Blur overlay */}
//                         <div className="absolute inset-0 backdrop-blur-sm bg-white/40 rounded-lg flex items-center justify-center z-10 group-hover:bg-white/50 transition-colors">
//                           <Crown className="w-6 h-6 text-amber-600" />
//                         </div>

//                         {/* Top corner elements (blurred) */}
//                         <div className="absolute top-2 left-2 blur-sm">
//                           <Folder className="w-4 h-4 text-amber-600" />
//                         </div>

//                         {/* Center content (blurred) */}
//                         <div className="text-center px-2 blur-sm">
//                           <span className="text-sm font-medium text-gray-900 line-clamp-2 break-words leading-tight">
//                             {board.name}
//                           </span>
//                         </div>

//                         {/* Pro badge */}
//                         <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20">
//                           <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-medium">
//                             Upgrade
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                   <p className="text-sm text-gray-600">No boards yet</p>
//                   <p className="text-xs text-gray-500">Create your first board to get started</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Show upgrade prompt if there are blurred boards */}
//           {blurredBoards.length > 0 && (
//             <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Crown className="w-5 h-5 text-amber-600" />
//                   <div>
//                     <p className="text-sm font-medium text-amber-900">
//                       {blurredBoards.length} more board{blurredBoards.length !== 1 ? 's' : ''} available
//                     </p>
//                     <p className="text-xs text-amber-700">
//                       Upgrade to Pro to access all your boards
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setIsPricingModalOpen(true)}
//                   className="px-3 py-1 bg-[#564638] text-white text-xs font-medium rounded hover:bg-black transition-colors focus:outline-none focus:ring-0"
//                 >
//                   Upgrade
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Footer */}
//           <div className="flex justify-end space-x-3 pt-4 mt-10 [box-shadow:0px_-2px_8px_-4px_#0000000A,0px_-6px_16px_-3px_#00000005]">
//             <button
//               onClick={onClose}
//               disabled={processing}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-0 disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={processing || (boardsToAdd.size === 0 && boardsToRemove.size === 0) || isLoading}
//               className="px-4 py-2 text-sm font-medium text-white bg-[#564638] border border-transparent rounded-md hover:bg-black focus:outline-none focus:ring-0 disabled:opacity-60"
//             >
//               {processing ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Saving...
//                 </div>
//               ) : (
//                 getActionText()
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Pricing Modal */}
//       <PricingModal
//         isOpen={isPricingModalOpen}
//         onClose={handlePricingModalClose}
//         isAuthenticated={true}
//       />
//     </>
//   );
// };

// export default LibrarySelectionModal;
