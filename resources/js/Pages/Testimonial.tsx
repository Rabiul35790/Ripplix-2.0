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
      text: "Ripplix completely changed the pace of our design flow. What used to feel messy and slow suddenly became smooth and predictable. Within a few days, we were seeing noticeable improvements in collaboration, something we hadn’t been able to achieve before, even after trying multiple tools. Ripplix simply delivered in a way none of our previous attempts ever did.",
      author: "Daniel Patrick",
      role: "UX Motion Lead",
      avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
      id: 2,
      text: "Our team felt the difference almost instantly after switching to Ripplix. The workflow felt lighter, faster, and far more organized. Engagement rose quickly, and cross-team communication stopped feeling like a bottleneck. We had tested several alternatives in the past, but none managed to bring this level of polish and consistency the way Ripplix did.",
      author: "Sarah Chen",
      role: "Creative Director",
      avatar: "https://i.pravatar.cc/150?img=33"
    },
    {
      id: 3,
      text: "Ripplix brought a refreshing level of clarity to our design system. Tasks that used to require extra discussions became effortless, helping us move almost 50% faster. We had experimented with similar ideas before, but nothing truly stuck until we adopted Ripplix. It felt like the piece we were always missing but didn’t know how to describe.",
      author: "Marcus Johnson",
      role: "Senior Animator",
      avatar: "https://i.pravatar.cc/150?img=25"
    },
    {
      id: 4,
      text: "The impact Ripplix had on our workflow became obvious right from the beginning. Our team adapted quickly and felt a real boost in engagement within the first few days. It made our collaboration more fluid and removed the friction we had become used to.",
      author: "Emily Rodriguez",
      role: "Product Designer",
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
      id: 5,
      text: "Adopting Ripplix was one of the easiest decisions we’ve made. From day one, our workflow became faster, cleaner, and far more enjoyable. Engagement jumped noticeably, and the way Ripplix blends advanced motion features we never previously used gave our team a fresh sense of creativity. It consistently performed better than every tool we tested before it.",
      author: "Alex Kumar",
      role: "Design Lead",
      avatar: "https://i.pravatar.cc/150?img=58"
    },
    {
      id: 6,
      text: "Ripplix helped us streamline our entire design cycle without any learning curve. The speed improvements were obvious—our team felt noticeably more productive almost immediately. We had tried several methods to improve our flow in the past, but none managed to deliver concrete results the way Ripplix did across every stage of the process.",
      author: "Jessica Taylor",
      role: "UI/UX Designer",
      avatar: "https://i.pravatar.cc/150?img=68"
    },
    {
      id: 7,
      text: "The difference Ripplix made to our motion workflow was surprisingly big. Our engagement metrics went up, handoffs became smoother, and the team regained the creative energy we’d been missing. Even the more complex tasks we previously struggled with felt more manageable. No other tool gave us this kind of boost or reliability.",
      author: "Ryan Mitchell",
      role: "Motion Designer",
      avatar: "https://i.pravatar.cc/150?img=15"
    },
    {
      id: 8,
      text: "Ripplix quickly became the tool our creative team relies on the most. Within a few days, everyone noticed how much easier it was to stay aligned during fast-paced projects. The motion features, especially the newer ones we hadn’t used before, added a layer of polish that improved both our speed and our final output.",
      author: "Olivia Brown",
      role: "Art Director",
      avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
      id: 9,
      text: "Our design process improved dramatically after adopting Ripplix. Tasks flowed more naturally, handoffs became predictable, and our team felt more confident experimenting with new ideas. The motion tools alone opened up possibilities we hadn’t explored earlier. It quickly became a core part of our workflow.",
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
          Trusted by 1,200+ Designers Exploring<br /> UI Animation
        </h2>
        <p className="font-poppins text-[#828287] text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
          Designers and motion teams rely on Ripplix to study real UI animation examples, refine micro-interactions and improve interaction design across web, mobile and emerging platforms.
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
