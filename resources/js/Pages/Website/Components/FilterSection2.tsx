import React, { useState } from 'react';
import { Grid3X3, Grid2X2 } from 'lucide-react';

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface FilterSection2Props {
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  cardsPerRow: number;
  onCardsPerRowChange: (count: number) => void;
}

const FilterSection2: React.FC<FilterSection2Props> = ({
  filters,
  selectedPlatform,
  onPlatformChange,
  cardsPerRow,
  onCardsPerRowChange,
}) => {
  const [isChanging, setIsChanging] = useState(false);

  // Create filter tabs with 'All' option plus platform names
  const filterTabs = [
    { key: 'all', label: 'All' },
    ...(filters?.platforms?.map(platform => ({
      key: platform.name.toLowerCase(),
      label: platform.name
    })) || [])
  ];

  const handleFilterClick = async (platformKey: string) => {
    if (platformKey === selectedPlatform) return;

    setIsChanging(true);
    await onPlatformChange(platformKey);
    setIsChanging(false);
  };

  const handleGridViewChange = (count: number) => {
    onCardsPerRowChange(count);
  };

  return (
    <div className="bg-[#F8F8F9] dark:bg-gray-900 px-4 sm:px-6 py-4 font-sora">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center bg-white flex-wrap border rounded-lg p-1 border-[#E3E2FF] dark:border-gray-300 overflow-x-auto">
          <div className="flex space-x-1 sm:space-x-3 min-w-max">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFilterClick(tab.key)}
                disabled={isChanging}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none whitespace-nowrap text-sm sm:text-base ${
                  selectedPlatform === tab.key
                    ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                    : 'text-[#3F3868] dark:text-gray-300 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
                } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isChanging && selectedPlatform === tab.key && (
                  <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#2B235A] rounded-full animate-spin mr-2"></span>
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Options - Hidden on mobile (sm and below) */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center bg-white space-x-2 border rounded-lg p-1 border-[#E3E2FF] dark:border-gray-300">
            {/* 3 Cards per Row */}
            <button
              onClick={() => handleGridViewChange(3)}
              className={`p-2 rounded-lg transition-colors focus:outline-none ${
                cardsPerRow === 3
                  ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                  : 'text-[#3F3868] dark:text-gray-400 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
              }`}
              title="3 cards per row"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>

            {/* 2 Cards per Row */}
            <button
              onClick={() => handleGridViewChange(2)}
              className={`p-2 rounded-lg transition-colors focus:outline-none ${
                cardsPerRow === 2
                  ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                  : 'text-[#3F3868] dark:text-gray-400 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
              }`}
              title="2 cards per row"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection2;
