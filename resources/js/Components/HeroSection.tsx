import React, { useMemo } from 'react';

interface Settings {
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
  hero_image?: string;
  copyright_text?: string;
}

interface HeroSectionProps {
  settings?: Settings;
}

const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const avats = useMemo(() => [
    '/images/hero/tes1.jpg',
    '/images/hero/tes2.jpg',
    '/images/hero/tes3.jpg',
  ], []);

  const categories = useMemo(() => [
    {
      svg: '/images/website.svg',
      desktopPosition: 'top-[20%] left-[11%]',
      laptopPosition: 'top-[14%] left-[8%]',
      mobilePosition: 'top-[1%] left-[5%]',
      animationPath: 'circular-top-left',
    },
    {
      svg: '/images/vr.svg',
      desktopPosition: 'top-[20%] left-[32%]',
      laptopPosition: 'top-[14%] left-[26%]',
      mobilePosition: 'top-[1%] left-[38%]',
      animationPath: 'circular-top-center',
    },
    {
      svg: '/images/webapp.svg',
      desktopPosition: 'top-[22%] left-[50%]',
      laptopPosition: 'top-[18%] left-[42%]',
      mobilePosition: 'top-[2%] right-[5%]',
      animationPath: 'circular-top-right',
    },
    {
      svg: '/images/mobile.svg',
      desktopPosition: 'bottom-[20%] left-[25%]',
      laptopPosition: 'bottom-[10%] left-[25%]',
      mobilePosition: 'bottom-[32%] left-[5%]',
      animationPath: 'circular-bottom-left',
    },
    {
      svg: '/images/watch.svg',
      desktopPosition: 'bottom-[28%] left-[45%]',
      laptopPosition: 'bottom-[20%] left-[40%]',
      mobilePosition: 'bottom-[32%] right-[5%]',
      animationPath: 'circular-bottom-right',
    }
  ], []);

  const handleBookmark = () => {
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D';
      alert(`Please bookmark this page by pressing ${shortcut}`);
    }
  };

  return (
    <div className="w-full min-h-[80vh] md:min-h-screen bg-white relative overflow-hidden flex items-center p-8 md:py-12">
      {/* Layer 2: Hero Image with upward animation */}
      <div className="absolute inset-0 z-0">
        <div className="hero-image-container w-full h-full">
          <img
            src={settings?.hero_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop'}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* Layer 3: Glass Effect Overlay */}
      <div className="absolute inset-0 z-[5] glass-overlay"></div>

      <style>{`
        @keyframes slideUpImage {
          from {
            transform: translateY(40%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .hero-image-container {
          animation: slideUpImage 1.8s ease-out forwards;
        }

        .glass-overlay {
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.95) 20%,
            rgba(255, 255, 255, 0.85) 35%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
          .glass-overlay {
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.3) 30%,
              rgba(255, 255, 255, 0.85) 50%,
              rgba(255, 255, 255, 0.95) 65%,
              rgba(255, 255, 255, 1) 80%,
              rgba(255, 255, 255, 1) 100%
            );
          }
        }

        /* Laptop-specific overlay (769px - 1280px) */
        @media (min-width: 769px) and (max-width: 1280px) {
          .glass-overlay {
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 1) 0%,
              rgba(255, 255, 255, 0.96) 15%,
              rgba(255, 255, 255, 0.88) 30%,
              rgba(255, 255, 255, 0.6) 45%,
              rgba(255, 255, 255, 0.2) 65%,
              rgba(255, 255, 255, 0) 80%
            );
          }
        }

        .category-badge {
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: badgeCircularAppear 1.8s ease-out forwards;
        }

        @keyframes badgeCircularAppear {
          0% {
            transform: translate(var(--start-x), var(--start-y)) scale(1);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }

        .circular-top-left {
          --start-x: -150px;
          --start-y: -100px;
        }

        .circular-top-center {
          --start-x: 0px;
          --start-y: -150px;
        }

        .circular-top-right {
          --start-x: 150px;
          --start-y: -100px;
        }

        .circular-bottom-left {
          --start-x: -120px;
          --start-y: 120px;
        }

        .circular-bottom-right {
          --start-x: 120px;
          --start-y: 120px;
        }

        /* Mobile-specific animation paths */
        @media (max-width: 768px) {
          .circular-top-left {
            --start-x: -80px;
            --start-y: -60px;
          }

          .circular-top-center {
            --start-x: 0px;
            --start-y: -80px;
          }

          .circular-top-right {
            --start-x: 80px;
            --start-y: -60px;
          }

          .circular-bottom-left {
            --start-x: -70px;
            --start-y: 80px;
          }

          .circular-bottom-right {
            --start-x: 70px;
            --start-y: 80px;
          }
        }

        .gradient-text {
          color: #231C50;
        }

        .text-muted {
          color: #D9DBE8;
        }

        /* Mobile positioning for badges */
        @media (max-width: 768px) {
          .mobile-badge-1 { top: 1%; left: 5%; }
          .mobile-badge-2 { top: 1%; left: 38%; }
          .mobile-badge-3 { top: 2%; right: 5%; }
          .mobile-badge-4 { bottom: 25%; left: 1%; }
          .mobile-badge-5 { bottom: 25%; right: 1%; }

          .mobile-badge-4 img {
            transform: rotate(-40deg);
             height: 85px;
             width: 115px;
          }
            .mobile-badge-1 img {
             height: 70px;
             width: 100px;
          }
            .mobile-badge-2 img {
             height: 65px;
             width: 85px;
          }
            .mobile-badge-3 img {
            height: 70px;
             width: 100px;
          }

          .mobile-badge-5 img {
            transform: rotate(40deg);
             height: 90px;
             width: 120px;
          }
        }

        /* Laptop positioning for badges (769px - 1280px) */
        @media (min-width: 769px) and (max-width: 1399px) {
          .laptop-badge-1 { top: 6%; left: 13%; }
          .laptop-badge-2 { top: 6%; left: 40%; }
          .laptop-badge-3 { top: 8%; left: 70%; }
          .laptop-badge-4 { bottom: 6%; left: 25%; }
          .laptop-badge-5 { bottom: 14%; left: 65%; }
        }

        /* Desktop positioning for badges (1281px+) */
        @media (min-width: 1400px) {
          .desktop-badge-1 { top: 15%; left: 12%; }
          .desktop-badge-2 { top: 15%; left: 33%; }
          .desktop-badge-3 { top: 18%; left: 51%; }
          .desktop-badge-4 { bottom: 16%; left: 25%; }
          .desktop-badge-5 { bottom: 25%; left: 50%; }
        }
      `}</style>

      {/* Floating Category Badges */}
      {categories.map((category, idx) => {
        return (
          <div
            key={idx}
            className={`category-badge ${category.animationPath} absolute z-20 mobile-badge-${idx + 1} laptop-badge-${idx + 1} desktop-badge-${idx + 1}`}
          >
            <img
              src={category.svg}
              alt={`Category ${idx + 1}`}
              className="w-auto h-auto max-w-none"
              loading="eager"
              decoding="async"
            />
          </div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 max-w-[1900px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="flex flex-col items-center md:items-start justify-center text-left space-y-4 sm:space-y-5 md:space-y-5 lg:space-y-6 xl:space-y-8 ml-0 sm:ml-4 md:ml-6 lg:ml-8 xl:ml-12 2xl:ml-20 mt-8 sm:mt-0" style={{ maxWidth: '900px' }}>

          {/* Heading */}
          <h1
            className="
              font-sora
              text-center md:text-left
              !font-semibold md:!font-bold
              leading-tight
              text-[2rem]
              sm:text-[2rem]
              md:text-[clamp(2rem,4.5vw,3rem)]
              lg:text-[clamp(2.5rem,5vw,3.5rem)]
              xl:text-[clamp(3rem,5vw,3.75rem)]
            "
          >
            {/* MOBILE — exactly 3 lines */}
            <span className="block md:hidden">
              <span className="text-muted">Your </span>
              <span className="gradient-text">Netflix for UI</span>
            </span>

            <span className="block md:hidden gradient-text whitespace-nowrap">
              Animation &amp; Micro-
            </span>

            <span className="block md:hidden gradient-text whitespace-nowrap">
              Interaction
              <span className="text-muted"> Design</span>
            </span>

            {/* DESKTOP / md+ — original phrasing */}
            <span className="hidden md:inline">
              <span className="text-muted">Your </span>
              <span className="gradient-text">Netflix for<br className="md:hidden" /></span>
              <span className="gradient-text hidden md:inline"> UI Animation </span><br className="hidden md:block" />
              <span className="gradient-text md:hidden">UI Animation <br /></span>
              <span className="gradient-text">&amp; Micro-Interaction</span>
              <span className="text-muted"> Design</span>
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-base lg:text-lg xl:text-xl text-[#555555] leading-relaxed max-w-[280px] sm:max-w-xl md:max-w-2xl lg:max-w-[720px] xl:max-w-[820px] font-normal text-center md:text-left font-poppins">
            A curated, evolving library of the world's best UI animations. Stream inspiration, study motion systems, and design experiences users feel.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center md:items-start sm:items-center gap-4 sm:gap-5 pt-2 w-full">
            <button
              onClick={handleBookmark}
              className="holographic-link2 group relative px-3.5 sm:px-7 md:px-7 lg:px-8 py-2 sm:py-3 md:py-3 lg:py-3.5 bg-[#6343D6] text-white font-semibold rounded-xl transition-all duration-300 w-auto sm:w-auto text-sm md:text-sm lg:text-base outline-none focus:outline-none focus:ring-0"
            >
              <span className="font-sora relative z-10 !font-semibold">Bookmark Now</span>
            </button>

            {/* User Avatars */}
            <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex -space-x-2 sm:-space-x-3">
                {avats.map((avat, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-full border-2 border-[#CECCFF] overflow-hidden bg-[#CECCFF] flex-shrink-0 shadow-sm"
                  >
                    <img
                      src={avat}
                      alt={`User ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col text-center md:text-left">
                <span className="text-[#9C9EBA] text-sm sm:text-sm md:text-sm lg:text-base font-semibold whitespace-nowrap md:whitespace-nowrap">
                  <span className="md:hidden">4k+ designers<br />returning daily</span>
                  <span className="hidden md:inline">4k+ Designers returning daily</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
