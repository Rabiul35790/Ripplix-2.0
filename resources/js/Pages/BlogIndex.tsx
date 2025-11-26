import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogLayout from './BlogLayout';
import BlogCard from '@/Components/BlogCard';
import BlogFilterSection from '@/Components/BlogFilterSection';
import BlogSearch from '@/Components/BlogSearch';
import axios from 'axios';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_images?: string[];
  published_date: string;
  author: string;
  category?: BlogCategory;
}

interface BlogIndexProps extends PageProps {
  categories: BlogCategory[];
  userPlanLimits?: any;
  currentPlan?: any;
  settings?: {
    logo?: string;
    copyright_text?: string;
    site_name?: string;
  };
  filters?: any;
}

const BlogIndex: React.FC<BlogIndexProps> = ({
  categories = [],
  userPlanLimits,
  currentPlan,
  settings,
  filters,
  auth
}) => {
  const { props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Fetch blogs
  const fetchBlogs = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get('/api/blogs', {
        params: {
          page,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          sort: sortOrder
        }
      });

      if (append) {
        setBlogs(prev => [...prev, ...response.data.data]);
      } else {
        setBlogs(response.data.data);
      }

      setHasMorePages(response.data.current_page < response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchBlogs(1, false);
  }, [searchQuery, selectedCategory, sortOrder]);

  // Load more handler
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePages) {
      fetchBlogs(currentPage + 1, true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortOrderChange = (order: 'latest' | 'oldest') => {
    setSortOrder(order);
  };

  return (
    <>
      <Head title="Blog" />

      <BlogLayout
        settings={settings}
        filters={filters}
        currentPlan={currentPlan}
        userPlanLimits={userPlanLimits}
        auth={authData}
        ziggy={ziggyData}
      >
        {/* Top Section with Original Background */}
        <div className="bg-[#F9F5FF]  pt-10 lg:pt-12">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-12 pt-6 sm:pt-8">
              <button className="bg-[#ece9fe] text-[#5E54AB] font-poppins text-xs sm:!text-sm font-medium mb-2 sm:mb-3 px-2 py-1 rounded-[4px] outline-none focus:outline-none focus:ring-0">
                Our blog
              </button>
              <h1 className="text-[#443B82] dark:text-white font-sora text-2xl sm:text-3xl md:text-4xl lg:text-5xl !font-semibold mb-3 sm:mb-4 lg:mb-6 px-4">
                Resources and insights
              </h1>
              <p className="text-[#5E54AB] dark:text-gray-400 font-poppins text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                The latest industry news, insights, technologies, and resources.
              </p>

              {/* Search */}
              <div className="max-w-xs sm:max-w-sm mx-auto px-4">
                <BlogSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search"
                />
              </div>
            </div>

            {/* Filter Section */}
            <div className="px-0 sm:px-0">
              <BlogFilterSection
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                sortOrder={sortOrder}
                onSortOrderChange={handleSortOrderChange}
              />
            </div>
          </div>
        </div>

        {/* Background Image Section with Cards */}
        <div
          className="w-full bg-white bg-no-repeat pb-8 sm:pb-10 lg:pb-12"
          style={{
            backgroundImage: "url('/images/logo/blendbg.png')",
            backgroundSize: '100% auto',
            backgroundPosition: 'center top'
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Blog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-6 sm:mt-8 pb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-[12px] h-[350px] sm:h-[400px]"></div>
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
                <div className="max-w-md mx-auto">
                  <h3 className="text-[#443B82] dark:text-white font-sora text-xl sm:text-2xl !font-semibold mb-2 sm:mb-3">
                    No blogs found
                  </h3>
                  <p className="text-[#62626C] dark:text-gray-400 font-poppins text-sm sm:text-base mb-6">
                    We couldn't find any blogs matching your criteria. Try adjusting your filters or search query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSortOrder('latest');
                    }}
                    className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white font-poppins font-medium px-6 py-2.5 text-sm sm:text-base rounded-[4px] hover:bg-[#7030b0] transition-colors focus:outline-none"
                  >
                    <span>Clear All Filters</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-6 sm:mt-8">
                  {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePages && (
                  <div className="text-center mt-8 sm:mt-10 lg:mt-12 pb-8 sm:pb-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-[#8941D1] text-white font-poppins font-medium px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-[4px] hover:bg-[#7030b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none w-full sm:w-auto max-w-xs"
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* White Background Section Below */}

        </div>
      </BlogLayout>
    </>
  );
};

export default BlogIndex;
