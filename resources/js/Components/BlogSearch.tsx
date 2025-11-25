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
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[#7F7F8A]" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 bg-white border border-[#E3E2FF] dark:border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#8941D1] text-[#150F32] dark:text-white placeholder-[#7F7F8A] text-sm font-poppins"
      />
    </div>
  );
};

export default BlogSearch;
