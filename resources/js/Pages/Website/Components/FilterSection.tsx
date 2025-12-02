import React from 'react';
import { Grid3X3, Grid2X2 } from 'lucide-react';

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface FilterSectionProps {
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

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  selectedPlatform,
  onPlatformChange,
  cardsPerRow,
  onCardsPerRowChange,
}) => {
  // Create filter tabs with 'All' option plus platform names
  const filterTabs = [
    { key: 'all', label: 'All' },
    ...(filters?.platforms?.map(platform => ({
      key: platform.name.toLowerCase(),
      label: platform.name
    })) || [])
  ];

  const handleFilterClick = (platformKey: string) => {
    if (platformKey === selectedPlatform) return;
    onPlatformChange(platformKey);
  };

  const handleGridViewChange = (count: number) => {
    onCardsPerRowChange(count);
  };

  return (
    <div className="bg-[#F8F8F9] dark:bg-gray-900 px-3 sm:px-4 md:px-6 py-1 font-sora">
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        {/* Filter Tabs - Fixed for mobile */}
        <div className="bg-white border rounded-lg p-1 border-[#E3E2FF] dark:border-gray-300 overflow-hidden max-w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 sm:space-x-2 md:space-x-3 min-w-max px-0.5 py-0.5">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterClick(tab.key)}
                  className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors focus:outline-none whitespace-nowrap text-xs sm:text-sm md:text-base ${
                    selectedPlatform === tab.key
                      ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                      : 'text-[#3F3868] dark:text-gray-300 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Options - Hidden on mobile (md and below) */}
        <div className="hidden lg:flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center bg-white space-x-1 sm:space-x-2 border rounded-lg p-1 border-[#E3E2FF] dark:border-gray-300">
            {/* 3 Cards per Row */}
            <button
              onClick={() => handleGridViewChange(3)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none ${
                cardsPerRow === 3
                  ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                  : 'text-[#3F3868] dark:text-gray-400 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
              }`}
              title="3 cards per row"
            >
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 2 Cards per Row */}
            <button
              onClick={() => handleGridViewChange(2)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none ${
                cardsPerRow === 2
                  ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                  : 'text-[#3F3868] dark:text-gray-400 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
              }`}
              title="2 cards per row"
            >
              <Grid2X2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FilterSection;
