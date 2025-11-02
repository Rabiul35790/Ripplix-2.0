// hooks/useModalUrl.ts
import { useState, useEffect, useCallback } from 'react';

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

interface UseModalUrlOptions {
  initialSelectedLibrary?: Library | null;
}

export const useModalUrl = (options: UseModalUrlOptions = {}) => {
  const [modalLibrary, setModalLibrary] = useState<Library | null>(
    options.initialSelectedLibrary || null
  );
  const [isModalOpen, setIsModalOpen] = useState(!!options.initialSelectedLibrary);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch library data from API
  const fetchLibraryData = useCallback(async (slug: string): Promise<Library | null> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/libraries/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }
      const data = await response.json();
      return data.library;
    } catch (error) {
      console.error('Error fetching library data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to update URL with library parameter
  const updateUrl = useCallback((librarySlug: string | null) => {
    const urlParams = new URLSearchParams(window.location.search);

    if (librarySlug) {
      urlParams.set('library', librarySlug);
    } else {
      urlParams.delete('library');
    }

    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }, []);

  // Function to open modal with library
  const openModal = useCallback(async (library: Library | string) => {
    if (typeof library === 'string') {
      // If library is a slug, fetch the data
      const libraryData = await fetchLibraryData(library);
      if (libraryData) {
        setModalLibrary(libraryData);
        setIsModalOpen(true);
        updateUrl(library);
      }
    } else {
      // If library is an object, use it directly
      setModalLibrary(library);
      setIsModalOpen(true);
      updateUrl(library.slug);
    }
  }, [fetchLibraryData, updateUrl]);

  // Function to close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalLibrary(null);
    updateUrl(null);
  }, [updateUrl]);

  // Function to navigate to different library in modal
  const navigateToLibrary = useCallback(async (library: Library | string) => {
    if (typeof library === 'string') {
      const libraryData = await fetchLibraryData(library);
      if (libraryData) {
        setModalLibrary(libraryData);
        updateUrl(library);
      }
    } else {
      setModalLibrary(library);
      updateUrl(library.slug);
    }
  }, [fetchLibraryData, updateUrl]);

  // Handle URL changes (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const librarySlug = urlParams.get('library');

      if (librarySlug && librarySlug !== modalLibrary?.slug) {
        // Open modal with new library
        fetchLibraryData(librarySlug).then(libraryData => {
          if (libraryData) {
            setModalLibrary(libraryData);
            setIsModalOpen(true);
          }
        });
      } else if (!librarySlug && isModalOpen) {
        // Close modal
        setIsModalOpen(false);
        setModalLibrary(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Check initial URL on mount
    const urlParams = new URLSearchParams(window.location.search);
    const librarySlug = urlParams.get('library');

    if (librarySlug && !modalLibrary) {
      fetchLibraryData(librarySlug).then(libraryData => {
        if (libraryData) {
          setModalLibrary(libraryData);
          setIsModalOpen(true);
        }
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [modalLibrary?.slug, isModalOpen, fetchLibraryData]);

  return {
    modalLibrary,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    navigateToLibrary
  };
};
