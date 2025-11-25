import React from 'react';
import { ChevronDown } from 'lucide-react';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogFilterSectionProps {
  categories: BlogCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOrder: 'latest' | 'oldest';
  onSortOrderChange: (order: 'latest' | 'oldest') => void;
}

const BlogFilterSection: React.FC<BlogFilterSectionProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortOrderChange,
}) => {
  const filterTabs = [
    { key: 'all', label: 'All' },
    ...categories.map(category => ({
      key: category.slug,
      label: category.name
    }))
  ];

  const handleFilterClick = (categoryKey: string) => {
    if (categoryKey === selectedCategory) return;
    onCategoryChange(categoryKey);
  };

  return (
    <div className="bg-[#F9F5FF] dark:bg-gray-900 py-4 font-sora">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center bg-white border rounded-lg p-1 border-[#E3E2FF] dark:border-gray-300 overflow-x-auto max-w-full">
          <div className="flex space-x-2 min-w-max">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFilterClick(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none whitespace-nowrap text-sm ${
                  selectedCategory === tab.key
                    ? 'bg-[#F5F5FA] dark:bg-gray-500 text-[#0A081B] dark:text-[#FAF9F6] border border-[#E3E2FF]'
                    : 'text-[#3F3868] dark:text-gray-300 hover:bg-[#F5F5FA] dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order Dropdown */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'latest' | 'oldest')}
            className="appearance-none bg-white border border-[#E3E2FF] dark:border-gray-300 rounded-lg px-4 py-2 pr-10 font-medium text-sm text-[#3F3868] dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#3F3868] dark:text-gray-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default BlogFilterSection;
