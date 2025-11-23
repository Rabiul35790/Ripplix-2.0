import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Boxes, ChevronRight, Command, Component } from 'lucide-react';

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface BrowseDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const BrowseDropdown: React.FC<BrowseDropdownProps> = ({
  isOpen,
  onClose,
  filters
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on a link (skip closing for navigation)
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also listen for touchstart on mobile
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Modified for better mobile interaction */}
      <div
        className="fixed inset-0 backdrop-blur-[2px] z-40"
        onClick={(e) => {
          // Only close if clicked on backdrop, not on links
          const target = e.target as HTMLElement;
          if (target.tagName !== 'A' && !target.closest('a')) {
            onClose();
          }
        }}
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="absolute left-0 top-16 bg-[#F7F7FC] dark:bg-gray-900 border border-[#B7B3FF] dark:border-gray-700 rounded-lg shadow-xl z-50
                   /* Mobile styles */
                   w-[calc(100vw-2rem)] max-w-[380px] mx-4
                   /* Tablet styles */
                   sm:w-[500px] sm:max-w-[500px] sm:mx-0
                   /* Desktop styles */
                   lg:w-[800px] lg:max-w-[800px]
                   max-h-[85vh] sm:max-h-[500px] overflow-hidden"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Mobile Layout - Stacked */}
        <div className="block lg:hidden">
          <div className="divide-y divide-[#B7B3FF] dark:divide-gray-700 h-full max-h-[85vh] overflow-y-auto">
            {/* Categories Section */}
            <div className="px-4">
              <div className="flex items-center mb-3 sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 pb-3 pt-4 -mx-4 px-4 z-10">
                <div className="w-6 h-6 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#B7B3FF] rounded flex items-center justify-center mr-2 flex-shrink-0">
                  <Command className='w-3 h-3'/>
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href="/all-apps"
                    className="font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-0"
                  >
                    Browse All Apps
                  </a>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#9D9DA8] dark:text-gray-400 mb-3">{filters.categories.length}+ Products</p>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filters.categories.slice(0, 6).map((category) => (
                  <a
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="flex items-center py-2 px-2 -mx-2 transition-colors group hover:bg-[#F5F5FA] dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-0 active:bg-gray-200 dark:active:bg-gray-700"
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-6 h-6 rounded-md mr-3 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md mr-3 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500">
                        <span className="text-white text-xs font-medium">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-[#2B235A] opacity-75 dark:text-gray-300 group-hover:opacity-100 dark:group-hover:text-white font-medium truncate min-w-0 flex-1 transition-opacity duration-500">
                      {category.name}
                    </span>
                  </a>
                ))}
                {filters.categories.length > 6 && (
                  <a
                    href="/all-apps"
                    className="text-xs text-[#2B235A] opacity-80 dark:text-blue-400 py-2 px-2 -mx-2 block rounded-md hover:opacity-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:outline-none focus:ring-0"
                  >
                    View all {filters.categories.length} apps →
                  </a>
                )}
              </div>
            </div>
            {/* Industries Section */}
            <div className="px-4">
            <div className="flex items-center mb-3 sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 pb-3 pt-4 -mx-4 px-4 z-10">
                <div className="w-6 h-6 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#B7B3FF] rounded flex items-center justify-center mr-2 flex-shrink-0">
                <Boxes className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                <a
                    href="/all-categories"
                    className="font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-0"
                >
                    Browse All Industries
                </a>
                </div>
            </div>
            <p className="text-xs font-semibold text-[#9D9DA8] dark:text-gray-400 mb-3">
                {filters.industries.length}+ Industries
            </p>

            <div className="space-y-1 max-h-32 overflow-y-auto">
                {filters.industries.slice(0, 6).map((industry) => (
                <a
                    key={industry.id}
                    href={`/browse?industry=${industry.slug}`}
                    className="flex items-center py-2 px-2 -mx-2 transition-colors group hover:bg-[#F5F5FA] dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-0 active:bg-gray-200 dark:active:bg-gray-700"
                >
                    <div className="w-6 h-6 mr-3 flex items-center justify-center text-sm text-[#2B235A] opacity-60 group-hover:opacity-100 dark:text-gray-500 dark:group-hover:text-gray-300 flex-shrink-0">
                    →
                    </div>
                    <span className="text-xs text-[#2B235A] opacity-75 dark:text-gray-300 group-hover:opacity-100 dark:group-hover:text-white font-medium truncate min-w-0 flex-1 transition-opacity duration-500">
                    {industry.name}
                    </span>
                </a>
                ))}
                {filters.industries.length > 6 && (
                <a
                    href="/all-categories"
                    className="text-xs text-[#2B235A] opacity-80 dark:text-blue-400 py-2 px-2 -mx-2 block rounded-md hover:opacity-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:outline-none focus:ring-0"
                >
                    View all {filters.industries.length} categories →
                </a>
                )}
            </div>
            </div>

            {/* Interactions Section */}
            <div className="px-4">
            <div className="flex items-center mb-3 sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 pb-3 pt-4 -mx-4 px-4 z-10">
                <div className="w-6 h-6 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#B7B3FF] rounded flex items-center justify-center mr-2 flex-shrink-0">
                <Component className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                <a
                    href="/all-elements"
                    className="font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-0"
                >
                    Browse All Elements
                </a>
                </div>
            </div>
            <p className="text-xs font-semibold text-[#9D9DA8] dark:text-gray-400 mb-3">
                {filters.interactions.length}+ Elements
            </p>

            <div className="space-y-1 max-h-32 overflow-y-auto">
                {filters.interactions.slice(0, 6).map((interaction) => (
                <a
                    key={interaction.id}
                    href={`/browse?interaction=${interaction.slug}`}
                    className="flex items-center py-2 px-2 -mx-2 transition-colors group hover:bg-[#F5F5FA] dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-0 active:bg-gray-200 dark:active:bg-gray-700"
                >
                    <div className="w-6 h-6 mr-3 flex items-center justify-center text-sm text-[#2B235A] opacity-60 group-hover:opacity-100 dark:text-gray-500 dark:group-hover:text-gray-300 flex-shrink-0">
                    →
                    </div>
                    <span className="text-xs text-[#2B235A] opacity-75 dark:text-gray-300 group-hover:opacity-100 dark:group-hover:text-white font-medium truncate min-w-0 flex-1 transition-opacity duration-500">
                    {interaction.name}
                    </span>
                </a>
                ))}
                {filters.interactions.length > 6 && (
                <a
                    href="/all-elements"
                    className="text-xs text-[#2B235A] opacity-80 dark:text-blue-400 py-2 px-2 -mx-2 block rounded-md hover:opacity-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:outline-none focus:ring-0"
                >
                    View all {filters.interactions.length} elements →
                </a>
                )}
            </div>
            </div>

          </div>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden lg:block font-sora">
          <div className="grid grid-cols-3 divide-x divide-[#E3E2FF] dark:divide-gray-700 h-full">
            {/* Categories Column */}
            <div className="relative overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 z-10 py-4 px-6 pb-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#E3E2FF] rounded flex items-center justify-center mr-3">
                    <Command className='w-4 h-4'/>
                  </div>
                  <div>
                    <Link
                      href="/all-apps"
                      onClick={onClose}
                      className="!font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 outline-none focus:outline-none focus:ring-0 transition-opacity duration-500"
                    >
                      Browse All Apps
                    </Link>
                  </div>
                </div>
                <p className="text-xs !font-semibold text-[#0A081B] dark:text-gray-400">{filters.categories.length}+ Products</p>
              </div>
              <div className="px-6 pb-7 pt-2">
                <div className="space-y-2">
                  {filters.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/browse?category=${category.slug}`}
                      onClick={onClose}
                      className="flex items-center transition-colors group outline-none focus:outline-none"
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-8 h-8 rounded-lg mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mr-3 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-[#2B235A] opacity-80 dark:text-gray-300 group-hover:opacity-100 transition-opacity duration-500 dark:group-hover:text-white font-medium">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Industries Column (Updated Color Palette to Match All Apps) */}
            <div className="relative overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 z-10 py-4 px-6 pb-2">
                <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#E3E2FF] rounded flex items-center justify-center mr-3">
                    <Boxes className='w-4 h-4'/>
                </div>
                <Link
                    href="/all-categories"
                    onClick={onClose}
                    className="!font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 outline-none focus:outline-none focus:ring-0 transition-opacity duration-500"
                >
                    Browse All Industries
                </Link>
                </div>
                <p className="text-xs !font-semibold text-[#0A081B] dark:text-gray-400">
                {filters.industries.length}+ Industries
                </p>
            </div>
            <div className="px-6 pb-7 pt-2">
                <div className="space-y-2">
                {filters.industries.map((industry) => (
                    <Link
                    key={industry.id}
                    href={`/browse?industry=${industry.slug}`}
                    onClick={onClose}
                    className="flex items-center transition-colors group outline-none focus:outline-none"
                    >
                    <div className="w-8 h-8 mr-3 flex items-center justify-center text-base text-[#2B235A] opacity-70 group-hover:opacity-100 dark:text-gray-500 dark:group-hover:text-white transition-opacity duration-500">
                        →
                    </div>
                    <span className="text-xs text-[#2B235A] opacity-80 dark:text-gray-300 group-hover:opacity-100 transition-opacity duration-500 dark:group-hover:text-white font-medium">
                        {industry.name}
                    </span>
                    </Link>
                ))}
                </div>
            </div>
            </div>

            {/* Interactions Column (Updated Color Palette to Match All Apps) */}
            <div className="relative overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="sticky top-0 bg-[#efeff7e5] dark:bg-gray-900 z-10 py-4 px-6 pb-2">
                <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#F7F7FCE5] dark:bg-blue-900 border border-[#E3E2FF] rounded flex items-center justify-center mr-3">
                    <Component className='w-4 h-4'/>
                </div>
                <Link
                    href="/all-elements"
                    onClick={onClose}
                    className="!font-semibold text-[#2B235A] opacity-85 dark:text-white text-sm hover:opacity-100 dark:hover:text-blue-400 outline-none focus:outline-none focus:ring-0 transition-opacity duration-500"
                >
                    Browse All Elements
                </Link>
                </div>
                <p className="text-xs !font-semibold text-[#0A081B] dark:text-gray-400">
                {filters.interactions.length}+ Elements
                </p>
            </div>
            <div className="px-6 pb-7 pt-2">
                <div className="space-y-2">
                {filters.interactions.map((interaction) => (
                    <Link
                    key={interaction.id}
                    href={`/browse?interaction=${interaction.slug}`}
                    onClick={onClose}
                    className="flex items-center transition-colors group outline-none focus:outline-none"
                    >
                    <div className="w-8 h-8 mr-3 flex items-center justify-center text-base text-[#2B235A] opacity-70 group-hover:opacity-100 dark:text-gray-500 dark:group-hover:text-white transition-opacity duration-500">
                        →
                    </div>
                    <span className="text-xs text-[#2B235A] opacity-80 dark:text-gray-300 group-hover:opacity-100 transition-opacity duration-500 dark:group-hover:text-white font-medium">
                        {interaction.name}
                    </span>
                    </Link>
                ))}
                </div>
            </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default BrowseDropdown;
