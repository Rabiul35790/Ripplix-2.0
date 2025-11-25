import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogLayout from './BlogLayout';
import BlogCard from '@/Components/BlogCard';
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
  featured_image_urls?: string[];
  published_date: string;
  author: string;
  meta_title?: string;
  meta_description?: string;
  category?: BlogCategory;
}

interface BlogShowProps extends PageProps {
  blog: Blog;
  relatedBlogs: Blog[];
  userPlanLimits?: any;
  currentPlan?: any;
  settings?: {
    logo?: string;
    copyright_text?: string;
    site_name?: string;
  };
  filters?: any;
}

// Helper function to get proper image URL
const getImageUrl = (blog: Blog): string => {
  // Priority 1: Use the accessor if available
  if (blog.featured_image_urls && blog.featured_image_urls.length > 0) {
    return blog.featured_image_urls[0];
  }

  // Priority 2: Check featured_images and build proper URL
  if (blog.featured_images && blog.featured_images.length > 0) {
    const imagePath = blog.featured_images[0];

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If path starts with 'storage/', use it directly
    if (imagePath.startsWith('storage/')) {
      return `/${imagePath}`;
    }

    // If path starts with '/', use it directly
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // Otherwise, prepend /storage/
    return `/storage/${imagePath}`;
  }

  // Priority 3: Fallback to placeholder
  return '/images/blog-placeholder.jpg';
};

const BlogShow: React.FC<BlogShowProps> = ({
  blog,
  relatedBlogs = [],
  userPlanLimits,
  currentPlan,
  settings,
  filters,
  auth
}) => {
  const { props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  const featuredImage = getImageUrl(blog);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Increment view count on mount
  useEffect(() => {
    axios.post(`/api/blogs/${blog.slug}/increment-view`).catch(console.error);
  }, [blog.slug]);

  return (
    <>
      <Head title={blog.meta_title || blog.title}>
        {blog.meta_description && (
          <meta name="description" content={blog.meta_description} />
        )}
      </Head>
      <BlogLayout
        settings={settings}
        filters={filters}
        currentPlan={currentPlan}
        userPlanLimits={userPlanLimits}
        auth={authData}
        ziggy={ziggyData}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Category & Date */}
              <div className="flex items-center gap-4 mb-4">
                {blog.category && (
                  <span className="text-[#8941D1] font-poppins text-sm font-medium uppercase">
                    {blog.category.name}
                  </span>
                )}
                <span className="text-[#7F7F8A] font-poppins text-sm">
                  {formatDate(blog.published_date)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[#150F32] dark:text-white font-sora text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-[#62626C] dark:text-gray-400 font-poppins text-lg mb-8">
                  {blog.excerpt}
                </p>
              )}

              {/* Featured Image */}
              <div className="mb-8 rounded-xl overflow-hidden">
                <img
                  src={featuredImage}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = '/images/blog-placeholder.jpg';
                  }}
                />
              </div>

              {/* Content */}
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-sora prose-headings:text-[#150F32] dark:prose-headings:text-white
                  prose-p:font-poppins prose-p:text-[#62626C] dark:prose-p:text-gray-400
                  prose-a:text-[#8941D1] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[#150F32] dark:prose-strong:text-white
                  prose-ul:font-poppins prose-ol:font-poppins
                  prose-li:text-[#62626C] dark:prose-li:text-gray-400
                  prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Sidebar - Try Ripplix Prompt (Sticky) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div
                  className="bg-gradient-to-br from-[#8941D1] to-[#6B2FB8] rounded-xl p-8 text-white"
                  style={{
                    boxShadow: '0px 10px 30px -5px rgba(137, 65, 209, 0.3)'
                  }}
                >
                  <h3 className="font-sora text-2xl font-bold mb-4">
                    Discover Thousands of Real UI Interactions
                  </h3>
                  <p className="font-poppins text-sm opacity-90 mb-6">
                    Unlock our ever-evolving database with kyper button motion patterns from real apps and own it for rewards.
                  </p>
                  <a
                    href="https://plugin.ripplix.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-[#8941D1] font-poppins font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                  >
                    Try Ripplix →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-[#150F32] dark:text-white font-sora text-2xl sm:text-3xl font-bold mb-8">
                See Related Blogs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <BlogCard key={relatedBlog.id} blog={relatedBlog} />
                ))}
              </div>
            </div>
          )}
        </div>
      </BlogLayout>
    </>
  );
};

export default BlogShow;
