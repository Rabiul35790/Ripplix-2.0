// import React, { useState, useEffect } from 'react';
// import { Head, usePage } from '@inertiajs/react';
// import Layout from './Website/Components/Layout';
// import LibraryGrid from './Website/Components/LibraryGrid';
// import LibraryModal from './Website/Components/LibraryModal';
// import FilterSection from './Website/Components/FilterSection';

// interface Library {
//   id: number;
//   title: string;
//   slug: string;
//   url: string;
//   video_url: string;
//   description?: string;
//   logo?: string;
//   platforms: Array<{ id: number; name: string }>;
//   categories: Array<{ id: number; name: string }>;
//   industries: Array<{ id: number; name: string }>;
//   interactions: Array<{ id: number; name: string }>;
// }

// interface Filter {
//   id: number;
//   name: string;
//   slug: string;
// }

// interface ExploreProps {
//   libraries: Library[];
//   filters: {
//     platforms: Filter[];
//     categories: Filter[];
//     industries: Filter[];
//     interactions: Filter[];
//   };
//   canLogin?: boolean;
//   canRegister?: boolean;
//   laravelVersion?: string;
//   phpVersion?: string;
// }

// const Explore: React.FC<ExploreProps> = ({
//   libraries: initialLibraries,
//   filters,
//   canLogin,
//   canRegister,
//   laravelVersion,
//   phpVersion
// }) => {
//   const { url } = usePage();
//   const [libraries, setLibraries] = useState<Library[]>(initialLibraries || []);
//   const [filteredLibraries, setFilteredLibraries] = useState<Library[]>(initialLibraries || []);
//   const [displayedLibraries, setDisplayedLibraries] = useState<Library[]>([]);
//   const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilters, setSelectedFilters] = useState({
//     platforms: [] as number[],
//     categories: [] as number[],
//     industries: [] as number[],
//     interactions: [] as number[],
//   });
//   const [cardsPerRow, setCardsPerRow] = useState(3);
//   const [visibleCount, setVisibleCount] = useState(20); // Start with 20 cards

//   // Filter libraries based on search and filters
//   useEffect(() => {
//     let filtered = [...(libraries || [])];

//     // Apply search filter
//     if (searchQuery) {
//       filtered = filtered.filter(library =>
//         library.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         library.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         library.platforms.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
//         library.interactions.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
//       );
//     }

//     // Apply platform filters
//     if (selectedFilters.platforms.length > 0) {
//       filtered = filtered.filter(library =>
//         library.platforms.some(platform => selectedFilters.platforms.includes(platform.id))
//       );
//     }

//     // Apply category filters
//     if (selectedFilters.categories.length > 0) {
//       filtered = filtered.filter(library =>
//         library.categories.some(category => selectedFilters.categories.includes(category.id))
//       );
//     }

//     // Apply industry filters
//     if (selectedFilters.industries.length > 0) {
//       filtered = filtered.filter(library =>
//         library.industries.some(industry => selectedFilters.industries.includes(industry.id))
//       );
//     }

//     // Apply interaction filters
//     if (selectedFilters.interactions.length > 0) {
//       filtered = filtered.filter(library =>
//         library.interactions.some(interaction => selectedFilters.interactions.includes(interaction.id))
//       );
//     }

//     setFilteredLibraries(filtered);
//     setVisibleCount(20); // Reset visible count when filters change
//   }, [libraries, searchQuery, selectedFilters]);

//   // Update displayed libraries when filteredLibraries or visibleCount changes
//   useEffect(() => {
//     setDisplayedLibraries(filteredLibraries.slice(0, visibleCount));
//   }, [filteredLibraries, visibleCount]);

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//   };

//   const handleFilterChange = (type: string, filterId: number) => {
//     setSelectedFilters(prev => {
//       const currentFilters = prev[type as keyof typeof prev];
//       const isSelected = currentFilters.includes(filterId);

//       return {
//         ...prev,
//         [type]: isSelected
//           ? currentFilters.filter(id => id !== filterId)
//           : [...currentFilters, filterId],
//       };
//     });
//   };

//   const handleLibraryClick = (library: Library) => {
//     setSelectedLibrary(library);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedLibrary(null);
//   };

//   const handleLoadMore = () => {
//     setVisibleCount(prev => prev + 20);
//   };

//   const hasMore = visibleCount < filteredLibraries.length;

//   return (
//     <>
//       <Head title="RippliX - UI Animation Library" />
//       <Layout
//         currentRoute={url}
//         onSearch={handleSearch}
//         searchQuery={searchQuery}
//       >
//         {/* Hero Section */}
//         <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
//           <div className="px-6 py-12 text-center">
//             <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               A Curated library of<br />
//               UI Animation to make<br />
//               your product more delightful
//             </h1>
//             <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
//               Explore interactive examples of UI animations, effects, and interactions
//               to make your product more engaging and delightful.
//             </p>
//             <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
//               Bookmark Now
//             </button>
//           </div>
//         </div>

//         {/* Filter Section */}
//         <FilterSection
//           filters={filters}
//           selectedFilters={selectedFilters}
//           onFilterChange={handleFilterChange}
//         />

//         {/* Library Grid */}
//         <LibraryGrid
//           libraries={displayedLibraries}
//           onLibraryClick={handleLibraryClick}
//           onLoadMore={handleLoadMore}
//           hasMore={hasMore}
//           isLoading={false}
//           cardsPerRow={cardsPerRow}
//         />

//         {/* Library Modal */}
//         <LibraryModal
//           library={selectedLibrary}
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//         />
//       </Layout>
//     </>
//   );
// };

// export default Explore;
