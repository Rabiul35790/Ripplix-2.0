// File: resources/js/hooks/useSearch.ts
import { useState, useMemo } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchKey: keyof T | ((item: T) => string);
  initialQuery?: string;
}

export function useSearch<T>({ data, searchKey, initialQuery = '' }: UseSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const searchTerm = searchQuery.toLowerCase();
    return data.filter(item => {
      let searchValue: string;

      if (typeof searchKey === 'function') {
        searchValue = searchKey(item);
      } else {
        searchValue = String(item[searchKey] || '');
      }

      return searchValue.toLowerCase().includes(searchTerm);
    });
  }, [data, searchQuery, searchKey]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    clearSearch,
    resultsCount: filteredData.length,
    totalCount: data.length,
    hasResults: filteredData.length > 0,
    isSearching: searchQuery.trim().length > 0
  };
}
