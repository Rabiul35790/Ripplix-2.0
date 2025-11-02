import React, { useState, useEffect } from 'react';
import { X, Crown, Lock, Check, Copy } from 'lucide-react';
import { useForm } from '@inertiajs/react';

interface Board {
  id?: number;
  name: string;
  creator_email: string;
  visibility: 'public' | 'private';
  share_via_link: boolean;
  share_via_email: boolean;
  share_emails?: string[];
  share_url?: string | null;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board?: Board | null;
  userEmail: string;
  userPlanLimits?: UserPlanLimits | null;
}

const BoardModal: React.FC<BoardModalProps> = ({
  isOpen,
  onClose,
  board = null,
  userEmail,
  userPlanLimits,
}) => {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    creator_email: userEmail,
    visibility: 'private' as 'public' | 'private',
    share_via_link: false as boolean,
    share_via_email: false as boolean,
    share_emails: [] as string[],
  });

  const [showUpgradeHint, setShowUpgradeHint] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (board) {
        setData('name', board.name);
        setData('creator_email', board.creator_email);
        setData('visibility', userPlanLimits?.canShare ? board.visibility : 'private');
        setData('share_via_link', userPlanLimits?.canShare ? board.share_via_link : false);
        setData('share_via_email', userPlanLimits?.canShare ? board.share_via_email : false);
        setData('share_emails', userPlanLimits?.canShare ? (board.share_emails || []) : []);
        setEmailInputValue(userPlanLimits?.canShare ? (board.share_emails || []).join(', ') : '');
      } else {
        setData('name', '');
        setData('creator_email', userEmail);
        setData('visibility', 'private');
        setData('share_via_link', false);
        setData('share_via_email', false);
        setData('share_emails', []);
        setEmailInputValue('');
      }
    }
  }, [isOpen, board, userEmail, userPlanLimits, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process email input before submitting
    const emails = emailInputValue.split(',').map(email => email.trim()).filter(email => email);
    setData('share_emails', emails);

    // Use setTimeout to ensure state is updated before submission
    setTimeout(() => {
      if (board?.id) {
        put(`/boards/${board.id}`, {
          onSuccess: () => {
            onClose();
            reset();
            setLinkCopied(false);
            setEmailInputValue('');
          }
        });
      } else {
        post('/boards', {
          onSuccess: () => {
            onClose();
            reset();
            setLinkCopied(false);
            setEmailInputValue('');
          }
        });
      }
    }, 0);
  };

  const handleClose = () => {
    onClose();
    reset();
    setShowUpgradeHint(false);
    setLinkCopied(false);
    setEmailInputValue('');
  };

  const handleSharingClick = () => {
    if (userPlanLimits?.isFree) {
      setShowUpgradeHint(true);
    }
  };

  const handleCopyLink = async () => {
    if (board?.share_url) {
      try {
        await navigator.clipboard.writeText(board.share_url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  if (!isOpen) return null;

  const isFreePlan = userPlanLimits?.isFree ?? false;
  const canShare = userPlanLimits?.canShare ?? true;
  const showShareLink = canShare && data.share_via_link && board?.share_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sora">
      <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md transition-opacity" onClick={handleClose} />

      <div className="relative w-full max-w-lg p-6 bg-[#F5F5FA] shadow-xl rounded-lg z-10 border-1 border-[#E0DAC8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-14">
          <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl lg:text-2xl font-sora !font-semibold text-[#0A081B]">
              {board ? 'Edit Collection' : 'Create New Collection'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-[#2B235A] hover:opacity-95 transition-opacity duration-500 focus:outline-none focus:ring-0 bg-[#FFFFFF] p-1"
          >
            <X className="w-4 h-4 md:h-5 md:w-5 lg:h-5 lg:w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#BABABA]">
                Collection Name
              </label>
              <input
                type="text"
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#FFFFFF] border border-[#E3E2FF] text-[#2B235A]
                            outline-none focus:outline-none focus:ring-0 focus:border-[#E3E2FF] placeholder:text-sm"
                placeholder="Enter board name"
                required
              />
              {(errors as any).name && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).name}</p>
              )}
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-[#BABABA]">
                Collection Visibility
              </label>
              <select
                id="visibility"
                value={data.visibility}
                onChange={(e) => canShare && setData('visibility', e.target.value as 'public' | 'private')}
                disabled={!canShare}
                className={`mt-1 block w-full rounded-md bg-[#FFFFFF] border border-[#E3E2FF] text-[#2B235A] outline-none focus:outline-none focus:ring-0 focus:border-[#E3E2FF] ${
                  !canShare ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !canShare && handleSharingClick()}
              >
                <option value="private">Only me</option>
                <option value="public">Public</option>
              </select>
              {!canShare && (
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Pro feature</span>
                </div>
              )}
            </div>
          </div>

          {/* Sharing Section */}
          <div className="space-y-3">
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#BABABA] ">Sharing Options</h4>
                {!canShare && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#EEE4FF] border border-[#CDA0FA] rounded text-xs">
                    <Crown className="w-3 h-3 text-[#9943EE] fill-current" />
                    <span className="text-[#2B235A] font-medium">Pro Feature</span>
                  </div>
                )}
              </div>

              {!canShare && showUpgradeHint && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Unlock Board Sharing</p>
                      <p className="text-blue-700 mt-1">
                        Upgrade to Pro to share your collections via link or email with team members and collaborators.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="share_via_link"
                  checked={canShare && data.share_via_link}
                  onChange={(e) => canShare && setData('share_via_link', e.target.checked)}
                  disabled={!canShare}
                  className={`rounded border-gray-300 text-[#2B235A] !outline-none focus:!outline-none focus:ring-0 ${
                    !canShare ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label
                  htmlFor="share_via_link"
                  className={`ml-2 text-sm ${canShare ? 'text-[#2B235A]' : 'text-gray-400'} ${
                    !canShare ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={handleSharingClick}
                >
                  Share via link
                </label>
                {!canShare && (
                  <Lock className="w-3 h-3 text-gray-400 ml-2" />
                )}
              </div>

              {/* Show share link field when share_via_link is enabled and we have a share_url */}
              {showShareLink && (
                <div className="ml-6 mt-2 p-3 bg-white border border-[#E3E2FF] rounded-md">
                  <label className="block text-xs font-medium text-[#BABABA] mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={board.share_url}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-50 border border-[#E3E2FF] text-[#2B235A] outline-none focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#2B235A] bg-white border border-[#CECCFF] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors whitespace-nowrap"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="share_via_email"
                  checked={canShare && data.share_via_email}
                  onChange={(e) => canShare && setData('share_via_email', e.target.checked)}
                  disabled={!canShare}
                  className={`rounded border-gray-300 text-[#2B235A] !outline-none focus:!outline-none focus:ring-0 ${
                    !canShare ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label
                  htmlFor="share_via_email"
                  className={`ml-2 text-sm ${canShare ? 'text-[#2B235A]' : 'text-gray-400'} ${
                    !canShare ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={handleSharingClick}
                >
                  Share via email
                </label>
                {!canShare && (
                  <Lock className="w-3 h-3 text-gray-400 ml-2" />
                )}
              </div>
            </div>

            {canShare && data.share_via_email && (
              <div className="ml-6">
                <label htmlFor="share_emails" className="block text-sm font-medium text-[#BABABA] mb-1">
                  Email address to share with
                </label>
                <input
                  id="share_emails"
                  type='text'
                  value={emailInputValue}
                  onChange={(e) => setEmailInputValue(e.target.value)}
                  onBlur={() => {
                    const emails = emailInputValue.split(',').map(email => email.trim()).filter(email => email);
                    setData('share_emails', emails);
                  }}
                  className="mt-1 block w-full rounded-md bg-[#FFFFFF] border border-[#E3E2FF] shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-[#E3E2FF] placeholder:text-sm text-[#2B235A]"
                  placeholder="user@example.com"
                />
              </div>
            )}
          </div>

          {/* Plan Limit Info for Free Users */}
          {isFreePlan && (
            <div className="mt-4 p-3 bg-[#EEE4FF] border border-[#CDA0FA] rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-[#9943EE] fill-current mt-0.5" />
                <div className="text-sm text-[#2B235A]">
                  <p className="font-medium">Plan Limits</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Maximum {userPlanLimits?.maxBoards} collections</li>
                    <li>• Maximum {userPlanLimits?.maxLibrariesPerBoard} interactions per collection</li>
                    <li>• Board sharing requires Pro plan</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(errors as any).plan_limit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{(errors as any).plan_limit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-[#2B235A] bg-white border border-[#CECCFF] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="holographic-link px-4 py-2 text-sm font-medium text-white bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] border border-transparent rounded-md hover:opacity-95 transition-opacity duration-500 focus:outline-none focus:ring-0 disabled:opacity-80"
            >
                <span>
                    {processing ? 'Saving...' : board ? 'Update Board' : 'Create Board'}
                </span>

            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardModal;
