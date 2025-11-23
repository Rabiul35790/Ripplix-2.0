import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { PageProps } from '@/types';
import MembershipModal from './Website/Components/MembershipModal';

interface CategoryHeaderProps {
  category: {
    id: number;
    name: string;
    image?: string;
    slug: string;
    product_url?: string;
    variant_name?: string;
  };
  auth: PageProps['auth'];
  ziggy: PageProps['ziggy'];
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, auth }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  useEffect(() => {
    if (auth?.user && category?.id) {
      checkFollowStatus();
    }
  }, [auth?.user, category?.id]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch('/following/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ category_id: category.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowClick = async () => {
    if (!auth?.user) {
      setShowMembershipModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isFollowing ? '/following/unfollow' : '/following/follow';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ category_id: category.id }),
      });

      if (response.ok) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);

        const event = new CustomEvent('category-follow-changed', {
          detail: {
            categoryId: category.id,
            categoryName: category.name,
            isFollowing: newFollowStatus,
            timestamp: Date.now(),
          },
        });
        window.dispatchEvent(event);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error || 'Failed to toggle follow');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add ref parameter to URL
  const addReferralParam = (url: string): string => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.append('ref', 'ripplix');
      return urlObj.toString();
    } catch {
      // Fallback for invalid URLs or relative paths
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}ref=ripplix`;
    }
  };

  const closeMembershipModal = () => setShowMembershipModal(false);

  return (
    <>
      <div className="bg-[#F8F8F9] px-2 sm:px-3 md:px-4 lg:px-4 dark:bg-gray-900 font-sora">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-4 md:py-3.5">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 border border-[#E3E2FF] p-4 sm:p-6 md:p-5 rounded-xl bg-[#F5F5FA]">

            {/* LEFT SIDE — Logo + Title + Category Badge */}
            <div className="flex flex-col gap-3">
              {/* Top Row: Image and Title */}
              <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 overflow-hidden rounded-full dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-2xl md:text-xl font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>

              {/* Bottom Row: Category Badge (left aligned) */}
            {category.variant_name &&(
                <div className="flex items-center gap-2 pl-0">
                <span className="text-[#BABABA] dark:text-gray-400 text-base">Category:</span>
                <span className="px-3 py-1 text-xs sm:text-sm border border-[#E3E2FF] rounded-[4px] bg-white text-[#443B82]">
                  {category.variant_name}
                </span>
              </div>
              )}
            </div>

            {/* RIGHT SIDE — Visit Site + Follow App */}
            <div className="flex items-center space-x-3">

              {/* VISIT SITE BUTTON */}
              {category.product_url && (
                <a
                href={addReferralParam(category.product_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="holographic-link2 flex items-center justify-center px-4 sm:px-4 md:px-3.5 py-2.5 sm:py-3 md:py-2.5
                           rounded-[4px] border border-[#CECCFF] text-xs sm:text-sm md:text-[13px]
                           font-semibold bg-white text-gray-900 hover:bg-gray-50 transition w-full sm:w-auto outline-none focus:outline-none focus:ring-0"
              >
                <span>
                Visit site
                </span>
              </a>)}

              {/* FOLLOW BUTTON */}
              <button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 px-4 sm:px-4 md:px-3.5 py-2.5 sm:py-3 md:py-2.5
                  rounded-[4px] text-xs sm:text-sm md:text-[13px] !font-semibold transition-colors font-sora
                  focus:outline-none focus:ring-0 w-full sm:w-auto shadow-[4px_4px_6px_0px_#34407C2E]
                  ${
                    isFollowing
                      ? 'bg-[#FFFFFF] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:opacity-90'
                      : 'holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white hover:opacity-95'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span>
                {isLoading ? 'Loading...' : isFollowing ? 'Followed' : 'Follow App'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <MembershipModal
        isOpen={showMembershipModal}
        onClose={closeMembershipModal}
        title="Become member to Follow App"
        message="Sign up now to follow your favorite Apps, discover new interactions, and stay updated with the latest designs."
        buttonText="Login"
        redirectUrl="/login"
      />
    </>
  );
};

export default CategoryHeader;
