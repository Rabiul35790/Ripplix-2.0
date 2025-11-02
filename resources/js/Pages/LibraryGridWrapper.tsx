import React from 'react';
import { PageProps } from '@/types';
import LibraryGrid from './LibraryGrid';
import { usePage } from '@inertiajs/react';

interface Library {
  id: number;
  title: string;
  slug: string;
  url: string;
  video_url: string;
  description?: string;
  logo?: string;
  platforms: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string; image?: string }>;
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
  created_at: string;
  published_date:string;
}

interface LibraryGridWrapperProps extends PageProps {
  displayedLibraries: Library[];
  onLibraryClick: (library: Library) => void;
  onLoadMore?: () => void;
  hasMore: boolean;
  cardsPerRow: number;
  userLibraryIds: number[];
  onStarClick: (library: Library, isStarred: boolean) => void;
  isAuthenticated?: boolean;
  isLoadingMore?: boolean;
}

const LibraryGridWrapper: React.FC<LibraryGridWrapperProps> = ({
  displayedLibraries,
  onLibraryClick,
  onLoadMore,
  hasMore,
  cardsPerRow,
  userLibraryIds,
  auth,
  onStarClick,
  isAuthenticated,
  isLoadingMore = false
}) => {
  const { props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-2 sm:mt-4 lg:mt-4 mb-8 sm:mb-10 lg:mb-12">
      <LibraryGrid
        libraries={displayedLibraries}
        onLibraryClick={onLibraryClick}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        cardsPerRow={cardsPerRow}
        auth={authData}
        ziggy={ziggyData}
        onStarClick={onStarClick}
        userLibraryIds={userLibraryIds}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default LibraryGridWrapper;
