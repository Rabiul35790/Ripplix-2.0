import React, { useState, useEffect } from 'react';
import { User, UserPlus, UserMinus } from 'lucide-react';
import { PageProps } from '@/types';
import MembershipModal from './Website/Components/MembershipModal';

interface CategoryHeaderProps {
  category: {
    id: number;
    name: string;
    image?: string;
    slug: string;
  };
  auth: PageProps['auth'];
  ziggy: PageProps['ziggy'];
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, auth, ziggy }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Check follow status on mount
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
    // Check if user is authenticated
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
        setIsFollowing(!isFollowing);
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

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
  };

  return (
    <>
      <div className="bg-[#F8F8F9] px-2 sm:px-3 md:px-4 lg:px-4 dark:bg-gray-900 font-sora">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-4 md:py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 border border-[#CECCFF] p-4 sm:p-6 md:p-5 rounded-xl bg-[#F5F5FA]">
            {/* Left side - Category info */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-3.5">
              {/* Category Image */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 overflow-hidden rounded-full dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-7 md:h-7 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Category Name */}
              <div>
                <h2 className="text-lg sm:text-2xl md:text-xl font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
              </div>
            </div>

            {/* Right side - Follow button */}
            <button
              onClick={handleFollowClick}
              disabled={isLoading}
              className={`flex items-center justify-center space-x-2 px-4 sm:px-4 md:px-3.5 py-2.5 sm:py-3 md:py-2.5 rounded-md text-xs sm:text-sm md:text-[13px] !font-semibold transition-colors font-sora focus:outline-none focus:ring-0 w-full sm:w-auto ${
                isFollowing
                  ? 'bg-[#FFFFFF] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:opacity-90 transition-opacity duration-500 dark:hover:bg-gray-700'
                  : 'holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white hover:opacity-95 transition-opacity duration-500'
              } ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {/* {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )} */}
              <span>
                {isLoading ? 'Loading...' : isFollowing ? 'Followed' : 'Follow App'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <MembershipModal
        isOpen={showMembershipModal}
        onClose={closeMembershipModal}
        title="Become member to Follow App"
        message="Sign up now to follow your favorite Apps, discover new interactions, and stay updated with the latest designs."
        buttonText="Become Member Now"
        redirectUrl="/login"
      />
    </>
  );
};

export default CategoryHeader;
