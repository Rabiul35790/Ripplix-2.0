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
      <Head title="Blog - Resources and Insights" />
      <BlogLayout
        settings={settings}
        filters={filters}
        currentPlan={currentPlan}
        userPlanLimits={userPlanLimits}
        auth={authData}
        ziggy={ziggyData}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[#8941D1] font-poppins text-sm font-medium mb-3">
              Our blog
            </p>
            <h1 className="text-[#150F32] dark:text-white font-sora text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Resources and insights
            </h1>
            <p className="text-[#62626C] dark:text-gray-400 font-poppins text-base sm:text-lg max-w-2xl mx-auto mb-8">
              The latest industry news, insights, technologies, and resources.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <BlogSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search"
              />
            </div>
          </div>

          {/* Filter Section */}
          <BlogFilterSection
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-[12px] h-[400px]"></div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#62626C] dark:text-gray-400 font-poppins text-lg">
                No blogs found. Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMorePages && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-[#8941D1] text-white font-poppins font-medium px-8 py-3 rounded-lg hover:bg-[#7030b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </BlogLayout>
    </>
  );
};

export default BlogIndex;
