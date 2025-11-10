import React from 'react';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
}

interface TestimonialsProps {
  heading?: string;
  subheading?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  heading = "1,200+ Creatives Can't Be Wrong",
  subheading = "Trusted by designers and studios who use Ripplix to explore and organize motion inspiration"
}) => {
  // Dummy testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability tried before was Ripplix transformed our design workflow right on schedule. tried before was Ripplix transformed",
      author: "Daniel Patrick",
      role: "UX Motion Lead",
      avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
      id: 2,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability tried before was Ripplix transformed our design workflow right on schedule.tried before was Ripplix transformed",
      author: "Sarah Chen",
      role: "Creative Director",
      avatar: "https://i.pravatar.cc/150?img=33"
    },
    {
      id: 3,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability tried before was Ripplix transformed tried before was Ripplix transformed",
      author: "Marcus Johnson",
      role: "Senior Animator",
      avatar: "https://i.pravatar.cc/150?img=25"
    },
    {
      id: 4,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and",
      author: "Emily Rodriguez",
      role: "Product Designer",
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
      id: 5,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability to integrate new motion tools we'd never tried before was Ripplix transformed our design workflow right on schedule. tried before was Ripplix transformed tried before was Ripplix transformed tried before was Ripplix transformed",
      author: "Alex Kumar",
      role: "Design Lead",
      avatar: "https://i.pravatar.cc/150?img=58"
    },
    {
      id: 6,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and tried before was Ripplix transformedtried before was Ripplix transformedtried before was Ripplix transformedtried before was Ripplix transformedtried before was Ripplix transformed",
      author: "Jessica Taylor",
      role: "UI/UX Designer",
      avatar: "https://i.pravatar.cc/150?img=68"
    },
    {
      id: 7,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability to integrate new motion 50% boost in engagement and tried before was Ripplix transformed our design workflow right on schedule.tried before was Ripplix transformed our design workflow right on schedule.",
      author: "Ryan Mitchell",
      role: "Motion Designer",
      avatar: "https://i.pravatar.cc/150?img=15"
    },
    {
      id: 8,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability to integrate new motion tools we'd never tried before was Ripplix transformed ",
      author: "Olivia Brown",
      role: "Art Director",
      avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
      id: 9,
      text: "Ripplix transformed our design workflow right on schedule. Within days of launch, our team saw a 50% boost in engagement and smoother design handoffs. Their ability to integrate new motion tools we'd never tried before was Ripplix",
      author: "David Lee",
      role: "Visual Designer",
      avatar: "https://i.pravatar.cc/150?img=41"
    }
  ];

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h2 className="font-sora text-2xl sm:text-3xl md:text-4xl lg:text-5xl !font-bold text-[#251C64] mb-3 md:mb-4 leading-tight">
          1,200+ Creatives Can't Be Wrong
        </h2>
        <p className="font-poppins text-[#828287] text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
          Trusted by designers and studios who use Ripplix to explore and organize motion inspiration
        </p>
      </div>

      {/* Testimonials Masonry Grid */}
      <div className="max-w-7xl mx-auto relative">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 lg:gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 break-inside-avoid mb-4 sm:mb-5 lg:mb-6 border border-[#F2F2FF]"
            >
              <p className="font-poppins text-[#2B235A] text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 lg:mb-6">
                {testimonial.text}
              </p>

              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-md object-cover bg-gray-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-sora !font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {testimonial.author}
                  </p>
                  <p className="font-poppins text-[#2D2D35] text-xs sm:text-sm truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 sm:h-56 lg:h-64 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #F8F8F9 0%, rgba(248, 248, 249, 0.7) 60%, rgba(248, 248, 249, 0.4) 80%, rgba(248, 248, 249, 0.2) 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default Testimonials;
