// FilterWrapper.tsx
import React from 'react';
import FilterSection from '../Pages/Website/Components/FilterSection';

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface FilterWrapperProps {
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

const FilterWrapper: React.FC<FilterWrapperProps> = ({
  filters,
  selectedPlatform,
  onPlatformChange,
  cardsPerRow,
  onCardsPerRowChange
}) => {
  return (
    <div className=" mt-2 sm:mt-4 lg:mt-4 bg-[#F8F8F9] dark:bg-gray-900 rounded-xl overflow-hidden">
      <FilterSection
        filters={filters}
        selectedPlatform={selectedPlatform}
        onPlatformChange={onPlatformChange}
        cardsPerRow={cardsPerRow}
        onCardsPerRowChange={onCardsPerRowChange}
      />
    </div>
  );
};

export default FilterWrapper;
