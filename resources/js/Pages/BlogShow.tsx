import React, { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogLayout from './BlogLayout';
import BlogCard from '@/Components/BlogCard';
import axios from 'axios';
import { ArrowLeft, Calendar, User } from 'lucide-react';

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

const getImageUrl = (blog: Blog): string => {
  if (blog.featured_image_urls && blog.featured_image_urls.length > 0) {
    return blog.featured_image_urls[0];
  }

  if (blog.featured_images && blog.featured_images.length > 0) {
    const imagePath = blog.featured_images[0];

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('storage/')) {
      return `/${imagePath}`;
    }

    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    return `/storage/${imagePath}`;
  }

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
  const contentRef = useRef<HTMLDivElement>(null);

  const featuredImage = getImageUrl(blog);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    axios.post(`/api/blogs/${blog.slug}/increment-view`).catch(console.error);
  }, [blog.slug]);

  // Process content to ensure proper styling
  useEffect(() => {
    if (contentRef.current) {
      // Remove any file attachment links (Filament adds these after images)
      const fileLinks = contentRef.current.querySelectorAll('a[download]');
      fileLinks.forEach(link => link.remove());

      // Style all images
      const images = contentRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '12px';
        img.style.margin = '2rem 0';
        img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      });

      // Ensure headings have proper styling
      const h1Elements = contentRef.current.querySelectorAll('h1');
      const h2Elements = contentRef.current.querySelectorAll('h2');
      const h3Elements = contentRef.current.querySelectorAll('h3');
      const h4Elements = contentRef.current.querySelectorAll('h4');

      h1Elements.forEach(h1 => {
        h1.style.fontSize = '2.25rem';
        h1.style.fontWeight = '700';
        h1.style.marginTop = '2rem';
        h1.style.marginBottom = '1rem';
        h1.style.fontFamily = 'Sora, sans-serif';
        h1.style.color = '#150F32';
      });

      h2Elements.forEach(h2 => {
        h2.style.fontSize = '1.875rem';
        h2.style.fontWeight = '700';
        h2.style.marginTop = '2rem';
        h2.style.marginBottom = '1rem';
        h2.style.fontFamily = 'Sora, sans-serif';
        h2.style.color = '#150F32';
      });

      h3Elements.forEach(h3 => {
        h3.style.fontSize = '1.5rem';
        h3.style.fontWeight = '600';
        h3.style.marginTop = '1.75rem';
        h3.style.marginBottom = '0.875rem';
        h3.style.fontFamily = 'Sora, sans-serif';
        h3.style.color = '#150F32';
      });

      h4Elements.forEach(h4 => {
        h4.style.fontSize = '1.25rem';
        h4.style.fontWeight = '600';
        h4.style.marginTop = '1.5rem';
        h4.style.marginBottom = '0.75rem';
        h4.style.fontFamily = 'Sora, sans-serif';
        h4.style.color = '#150F32';
      });

      // Style paragraphs
      const paragraphs = contentRef.current.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.fontFamily = 'Poppins, sans-serif';
        p.style.color = '#62626C';
      });
    }
  }, [blog.content]);

  const handleBack = () => {
    window.location.href = '/blog';
  };

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
        <div className="bg-[#F9F5FF]">
          <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div>
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-[#150F32] hover:opacity-80 font-poppins text-sm font-medium mb-6 sm:mb-8 lg:mb-10 transition-opacity duration-500 outline-none focus:outline-none focus:ring-0"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {blog.category && (
                    <span className="text-[#8941D1] font-poppins text-xs sm:text-sm !font-medium uppercase">
                      {blog.category.name}
                    </span>
                  )}
                </div>

                <h1 className="text-[#150F32] dark:text-white font-sora text-2xl sm:text-3xl lg:text-4xl xl:text-5xl !font-semibold mb-3 sm:mb-4 leading-tight">
                  {blog.title}
                </h1>

                {blog.excerpt && (
                  <p className="text-[#7F7F8A] dark:text-gray-400 font-poppins text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4">
                    {blog.excerpt}
                  </p>
                )}

                {(blog.author || blog.published_date) && (
                  <div className="flex flex-wrap items-center gap-2 text-[#7F7F8A] font-poppins text-xs sm:text-sm mb-6">
                    <span>By</span>

                    {blog.author && (
                      <span className="flex items-center text-[#150F32] gap-1.5 font-medium">
                        {blog.author}
                      </span>
                    )}

                    {blog.author && blog.published_date && <span>•</span>}

                    {blog.published_date && (
                      <span className="flex items-center gap-1.5">
                        {formatDate(blog.published_date)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl overflow-hidden h-[250px] sm:h-[300px] lg:h-[400px]">
                <img
                  src={featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/blog-placeholder.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8">
                <div
                  ref={contentRef}
                  className="blog-content prose prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <div
                    className="rounded-xl px-5 py-6 sm:px-6 sm:py-8 text-white flex flex-col items-center text-center max-w-sm mx-auto"
                    style={{
                      background: 'linear-gradient(101.84deg, #9943EE 3.72%, #51148D 98.49%)',
                      boxShadow: '0px 10px 30px -5px rgba(137, 65, 209, 0.3)'
                    }}
                  >
                    <h3 className="font-sora text-xl sm:text-2xl !font-bold max-w-[250px] mb-3 sm:mb-4">
                      Discover Thousands of Real UI Interactions
                    </h3>

                    <p className="font-poppins text-xs sm:text-sm opacity-90 max-w-72 mb-3 sm:mb-4">
                      Level up your design workflow with Ripplix explore motion patterns from real apps and save hours on research.
                    </p>

                    <img
                      src="/images/logo/prompt.png"
                      alt="Prompt Logo"
                      className="mb-3 sm:mb-4 object-contain w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]"
                    />

                    <Link
                      href={route('register')}
                      className="inline-block bg-white text-[#8941D1] font-poppins font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none text-sm sm:text-base"
                    >
                      Try Ripplix →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {relatedBlogs.length > 0 && (
              <div className="mt-12 sm:mt-16">
                <h2 className="text-[#150F32] dark:text-white font-sora text-xl sm:text-2xl lg:text-3xl !font-bold mb-6 sm:mb-8">
                  See Related Blogs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedBlogs.map((relatedBlog) => (
                    <BlogCard key={relatedBlog.id} blog={relatedBlog} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </BlogLayout>
    </>
  );
};

export default BlogShow;
