// useHomeLogic.ts - Simplified custom hook for Home component logic
import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';

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
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

interface UseHomeLogicProps {
  initialLibraries: Library[];
  initialSelectedLibrary: Library | null;
  initialPagination: Pagination;
  auth: any;
  userLibraryIds: number[];
}

export const useHomeLogic = ({
  initialLibraries,
  initialSelectedLibrary,
  initialPagination,
  auth
}: UseHomeLogicProps) => {
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries || []);
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>(initialLibraries || []);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(initialSelectedLibrary);
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedLibrary);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for optimization
  const loadingRef = useRef(false);

  // Handle initial selected library from URL
  useEffect(() => {
    if (initialSelectedLibrary) {
      setSelectedLibrary(initialSelectedLibrary);
      setIsModalOpen(true);
    }
  }, [initialSelectedLibrary]);

  // Filter libraries based on search and selected platform (client-side filtering)
  useEffect(() => {
    let filtered = [...libraries];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(library =>
        library.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        library.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        library.platforms.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        library.interactions.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(library =>
        library.platforms.some(platform =>
          platform.name.toLowerCase() === selectedPlatform.toLowerCase()
        )
      );
    }

    setFilteredLibraries(filtered);
  }, [libraries, searchQuery, selectedPlatform]);

  // Load more libraries from server
  const loadMoreLibraries = useCallback(async () => {
    if (loadingRef.current || !pagination.has_more) return;

    loadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = pagination.current_page + 1;
      const response = await fetch(`/api/home/load-more?page=${nextPage}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Append new libraries to existing ones
      setLibraries(prev => [...prev, ...data.libraries]);
      setPagination(data.pagination);

    } catch (error) {
      console.error('Failed to load more libraries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more libraries');
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [pagination]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handlePlatformChange = useCallback((platform: string) => {
    setSelectedPlatform(platform);
  }, []);

  const handleCardsPerRowChange = useCallback((count: number) => {
    setCardsPerRow(count);
  }, []);

  const handleLibraryClick = useCallback((library: Library) => {
    const libraryUrl = `/libraries/${library.slug}`;
    router.visit(libraryUrl, {
      preserveScroll: true,
      preserveState: true,
      only: ['selectedLibrary'],
      onSuccess: () => {
        setSelectedLibrary(library);
        setIsModalOpen(true);
      }
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    router.visit('/', {
      preserveScroll: true,
      preserveState: true,
      only: ['selectedLibrary'],
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedLibrary(null);
      }
    });
  }, []);

  const handleLibraryNavigation = useCallback((library: Library) => {
    const libraryUrl = `/libraries/${library.slug}`;
    router.visit(libraryUrl, {
      preserveScroll: true,
      preserveState: true,
      only: ['selectedLibrary'],
      onSuccess: () => {
        setSelectedLibrary(library);
      }
    });
  }, []);

  const handleStarClick = useCallback((library: Library, isStarred: boolean) => {
    if (!auth?.user) {
      console.log('User not authenticated');
      return;
    }
    // Handle star click logic here
  }, [auth]);

  // Manual load more handler for button click
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.has_more) {
      loadMoreLibraries();
    }
  }, [isLoadingMore, pagination.has_more, loadMoreLibraries]);

  console.log('Current Pagination:', pagination);

  return {
    // State
    selectedLibrary,
    isModalOpen,
    searchQuery,
    selectedPlatform,
    cardsPerRow,
    filteredLibraries,
    pagination,
    isLoadingMore,
    error,

    // Handlers
    handleSearch,
    handlePlatformChange,
    handleCardsPerRowChange,
    handleLibraryClick,
    handleCloseModal,
    handleLoadMore,
    handleLibraryNavigation,
    handleStarClick,

    // Computed values
    hasMore: pagination.has_more,
    totalLibraries: pagination.total,
    displayedLibraries: filteredLibraries
  };
};
