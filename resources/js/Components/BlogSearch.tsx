import React from 'react';
import { Search } from 'lucide-react';

interface BlogSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const BlogSearch: React.FC<BlogSearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search blogs...',
  className = ''
}) => {
  return (
    <div className={`relative w-full sm:w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#62626C]" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-[#D3D3DF] dark:border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 text-[#443B82] dark:text-white placeholder-[#62626C] text-xs sm:text-sm font-poppins"
      />
    </div>
  );
};

export default BlogSearch;
