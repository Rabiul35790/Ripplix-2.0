import React from 'react';
import { Link } from '@inertiajs/react';

interface BlogCardProps {
  blog: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_images?: string[];
    published_date: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const featuredImage = blog.featured_images && blog.featured_images.length > 0
    ? blog.featured_images[0]
    : '/images/blog-placeholder.jpg';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="block bg-white rounded-[12px] border border-[#F2F2FF] overflow-hidden transition-all duration-300 outline-none focus:outline-none"
      style={{
        boxShadow: '0px 2px 8px -4px #0000000A, 0px 6px 16px -3px #00000005'
      }}
    >
      <div className="p-6">
        {/* Featured Image */}
        <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-gray-100">
          <img
            src={featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Title - Max 2 lines */}
        <h3
          className="font-sora text-[22px] font-semibold text-[#150F32] mb-3 line-clamp-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {blog.title}
        </h3>

        {/* Excerpt - Max 2 lines */}
        <p
          className="font-poppins text-[14px] font-normal text-[#62626C] mb-4 line-clamp-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {blog.excerpt}
        </p>

        {/* Footer - Date & Category */}
        <div className="flex items-center justify-between">
          <span className="font-poppins text-[14px] font-normal text-[#7F7F8A]">
            {formatDate(blog.published_date)}
          </span>
          {blog.category && (
            <span className="font-poppins text-[14px] font-medium text-[#8941D1]">
              {blog.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
