// File: resources/js/Components/UniversalSearch.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface UniversalSearchProps<T> {
  data: T[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchKey: keyof T | ((item: T) => string);
  placeholder?: string;
  className?: string;
  showResultsCount?: boolean;
  noResultsText?: string;
  searchLabel?: string;
  onFilteredDataChange?: (filteredData: T[]) => void;
}

function UniversalSearch<T>({
  data,
  searchQuery,
  onSearchChange,
  searchKey,
  placeholder = "Search...",
  className = "",
  showResultsCount = false,
  noResultsText = "No results found",
  searchLabel = "items",
  onFilteredDataChange
}: UniversalSearchProps<T>) {
  const handleClear = () => {
    onSearchChange('');
  };

  const handleSearchChange = (query: string) => {
    onSearchChange(query);

    // If callback provided, return filtered data
    if (onFilteredDataChange) {
      const filteredData = getFilteredData(query);
      onFilteredDataChange(filteredData);
    }
  };

  const getFilteredData = (query: string = searchQuery): T[] => {
    if (!query.trim()) {
      return data;
    }

    const searchTerm = query.toLowerCase();
    return data.filter(item => {
      let searchValue: string;

      if (typeof searchKey === 'function') {
        searchValue = searchKey(item);
      } else {
        searchValue = String(item[searchKey] || '');
      }

      return searchValue.toLowerCase().includes(searchTerm);
    });
  };

  const filteredData = getFilteredData();
  const resultsCount = filteredData.length;
  const totalCount = data.length;

  return (
    <div className={`flex flex-col gap-4 font-sora ${className}`}>
      {/* Search Input Field */}
      <div className="relative lg:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#2B235A] dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 rounded-xl leading-5 bg-[#F5F5FA] dark:bg-gray-800 placeholder-[#2B235A] dark:placeholder-gray-400 text-[#2B235A] dark:text-white outline-none focus:!outline-none border-[#CECCFF] focus:border-[#CECCFF] focus:ring-0 transition-colors duration-200"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {showResultsCount && searchQuery && (
        <div className="mb-2">
          <p className="text-sm text-[#2B235A] dark:text-gray-400">
            {resultsCount === 0
              ? `${noResultsText} for "${searchQuery}"`
              : `Showing ${resultsCount} of ${totalCount} ${searchLabel} for "${searchQuery}"`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default UniversalSearch;
