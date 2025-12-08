import React, { useMemo } from 'react';
import { Smartphone, Layout, Watch, AppWindow, MousePointer2, RectangleGoggles } from 'lucide-react';

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
      name: 'Website',
      Icon: AppWindow,
      bg: '#E7F7FF',
      iconColor: '#2BB6FF',
      iconPosition: 'bottom-right',
      desktopPosition: 'top-[16%] left-[11%]',
      laptopPosition: 'top-[14%] left-[8%]',
      mobilePosition: 'top-[1%] left-[5%]',
      rotate: '-8deg',
      laptopRotate: '-6deg',
      animationPath: 'circular-top-left',
      border: '#2BB6FF',
      pointrot: 'rotate-180',
      pointfill: '#2BB6FF',
    },
    {
      name: 'AR/VR',
      Icon: RectangleGoggles,
      bg: '#FCECFF',
      iconColor: '#B13BC7',
      iconPosition: 'bottom-right',
      desktopPosition: 'top-[16%] left-[32%]',
      laptopPosition: 'top-[14%] left-[26%]',
      mobilePosition: 'top-[1%] left-[38%]',
      rotate: '6deg',
      laptopRotate: '5deg',
      animationPath: 'circular-top-center',
      border: '#B13BC7',
      pointrot: 'rotate-180',
      pointfill: '#B13BC7'
    },
    {
      name: 'Web App',
      Icon: Layout,
      bg: '#FFF7E6',
      iconColor: '#E69B0C',
      iconPosition: 'bottom-left',
      desktopPosition: 'top-[22%] left-[50%]',
      laptopPosition: 'top-[18%] left-[42%]',
      mobilePosition: 'top-[2%] right-[5%]',
      rotate: '10deg',
      laptopRotate: '8deg',
      animationPath: 'circular-top-right',
      border: '#E69B0C',
      pointrot: 'rotate-[-95deg]',
      pointfill: '#E69B0C'
    },
    {
      name: 'Mobile App',
      Icon: Smartphone,
      bg: '#E8E4FF',
      iconColor: '#8E79FF',
      iconPosition: 'top-right',
      desktopPosition: 'bottom-[20%] left-[25%]',
      laptopPosition: 'bottom-[18%] left-[18%]',
      mobilePosition: 'bottom-[32%] left-[5%]',
      rotate: '7deg',
      laptopRotate: '6deg',
      mobileRotate: '-25deg',
      animationPath: 'circular-bottom-left',
      border: '#8E79FF',
      pointrot: 'rotate-[80deg]',
      pointfill: '#8E79FF'
    },
    {
      name: 'Smartwatch',
      Icon: Watch,
      bg: '#FFEBE9',
      iconColor: '#F3785D',
      iconPosition: 'top-left',
      desktopPosition: 'bottom-[28%] left-[45%]',
      laptopPosition: 'bottom-[24%] left-[36%]',
      mobilePosition: 'bottom-[32%] right-[5%]',
      rotate: '-6deg',
      laptopRotate: '-5deg',
      mobileRotate: '25deg',
      animationPath: 'circular-bottom-right',
      border: '#F3785D',
      pointrot: 'rotate-60',
      pointfill: '#F3785D'
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
    <div className="w-full min-h-[70vh] md:min-h-screen bg-white relative overflow-hidden flex items-center py-8 md:py-12">
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
          animation: slideUpImage 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
          animation: badgeCircularAppear 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        @keyframes badgeCircularAppear {
          0% {
            opacity: 0;
            transform: translate(var(--start-x), var(--start-y)) scale(0.7) rotate(var(--rotate-start));
          }
          70% {
            transform: translate(0, 0) scale(1.02) rotate(var(--rotate-mid));
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(var(--rotate-end));
          }
        }

        .circular-top-left {
          --start-x: -150px;
          --start-y: -100px;
          --rotate-start: -45deg;
          --rotate-mid: -12deg;
          --rotate-end: -8deg;
        }

        .circular-top-center {
          --start-x: 0px;
          --start-y: -150px;
          --rotate-start: 20deg;
          --rotate-mid: 12deg;
          --rotate-end: 11deg;
        }

        .circular-top-right {
          --start-x: 150px;
          --start-y: -100px;
          --rotate-start: -20deg;
          --rotate-mid: -8deg;
          --rotate-end: 6deg;
        }

        .circular-bottom-left {
          --start-x: -120px;
          --start-y: 120px;
          --rotate-start: 25deg;
          --rotate-mid: 10deg;
          --rotate-end: 7deg;
        }

        .circular-bottom-right {
          --start-x: 120px;
          --start-y: 120px;
          --rotate-start: -25deg;
          --rotate-mid: -10deg;
          --rotate-end: -6deg;
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

        .content-fade-in {
          animation: contentFadeIn 1.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes contentFadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
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
          .mobile-badge-4 { bottom: 27%; left: 1%; }
          .mobile-badge-5 { bottom: 27%; right: 1%; }
        }

        /* Laptop positioning for badges (769px - 1280px) */
        @media (min-width: 769px) and (max-width: 1280px) {
          .laptop-badge-1 { top: 14%; left: 8%; }
          .laptop-badge-2 { top: 14%; left: 35%; }
          .laptop-badge-3 { top: 18%; left: 65%; }
          .laptop-badge-4 { bottom: 18%; left: 18%; }
          .laptop-badge-5 { bottom: 24%; left: 55%; }
        }

        /* Desktop positioning for badges (1281px+) */
        @media (min-width: 1281px) {
          .desktop-badge-1 { top: 16%; left: 11%; }
          .desktop-badge-2 { top: 16%; left: 32%; }
          .desktop-badge-3 { top: 22%; left: 50%; }
          .desktop-badge-4 { bottom: 20%; left: 25%; }
          .desktop-badge-5 { bottom: 28%; left: 50%; }
        }
      `}</style>

      {/* Floating Category Badges */}
      {categories.map((category, idx) => {
        let pointerPosition = '';
        if (category.iconPosition === 'bottom-right') {
          pointerPosition = 'absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3';
        } else if (category.iconPosition === 'bottom-left') {
          pointerPosition = 'absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3';
        } else if (category.iconPosition === 'top-right') {
          pointerPosition = 'absolute -top-2 -right-2 sm:-top-3 sm:-right-3';
        } else if (category.iconPosition === 'top-left') {
          pointerPosition = 'absolute -top-2 -left-2 sm:-top-3 sm:-left-3';
        }

        return (
          <div
            key={idx}
            className={`category-badge ${category.animationPath} flex absolute items-center gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 px-2.5 sm:px-3 md:px-3.5 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 rounded-full z-20 shadow-[0px_1px_3px_0px_#0000000A] flex-row mobile-badge-${idx + 1} laptop-badge-${idx + 1} desktop-badge-${idx + 1}`}
            style={{
              backgroundColor: category.bg,
              transform: `rotate(${category.rotate})`,
              border: '0.6px solid ' + category.border,
              position: 'absolute'
            }}
          >
            <style>{`
              @media (max-width: 768px) {
                .mobile-badge-${idx + 1} {
                  transform: rotate(${category.mobileRotate || category.rotate}) !important;
                }
              }
              @media (min-width: 769px) and (max-width: 1280px) {
                .laptop-badge-${idx + 1} {
                  transform: rotate(${category.laptopRotate || category.rotate}) !important;
                }
              }
            `}</style>
            <MousePointer2
              fill={category.pointfill}
              className={`w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transform ${category.pointrot} text-white flex-shrink-0 ${pointerPosition}`}

            />

            <category.Icon
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0`}
              style={{
                color: category.iconColor,
              }}
            />
            <span
              className="font-sora text-xs sm:text-sm md:text-sm lg:text-base !font-normal whitespace-nowrap"
              style={{ color: category.iconColor }}
            >
              {category.name}
            </span>
          </div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 max-w-[1900px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="flex flex-col items-center md:items-start justify-center text-left space-y-4 sm:space-y-5 md:space-y-5 lg:space-y-6 xl:space-y-8 ml-0 sm:ml-4 md:ml-6 lg:ml-8 xl:ml-12 2xl:ml-20 content-fade-in" style={{ maxWidth: '900px' }}>
          {/* Badge */}
          <div className="hidden md:inline-flex items-center gap-2 px-3 md:px-3.5 lg:px-4 py-1.5 md:py-2 rounded-full bg-[#F8F9FC] backdrop-blur-sm border border-[#E5E7EB]">
            <span className="text-[#7C3AED] text-xs md:text-xs lg:text-sm !font-semibold font-sora">New</span>
            <span className="text-[#6B7280] text-xs md:text-xs lg:text-sm !font-normal font-sora">5000+ microinteractions just landed</span>
          </div>

          {/* Heading */}
          <h1
            className="
              font-sora
              text-center md:text-left
              !font-semibold md:!font-bold
              leading-tight
              text-4xl
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

            <span className="block md:hidden gradient-text">
              Animation & Micro-
            </span>

            <span className="block md:hidden gradient-text">
              Interaction Design
            </span>

            {/* DESKTOP / md+ — original phrasing */}
            <span className="hidden md:inline">
              <span className="text-muted">Your </span>
              <span className="gradient-text">Netflix for<br className="md:hidden" /></span>
              <span className="gradient-text hidden md:inline"> UI Animation </span><br className="hidden md:block" />
              <span className="gradient-text md:hidden">UI Animation <br /></span>
              <span className="gradient-text">& Micro-Interaction</span>
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
              className="holographic-link2 group relative px-6 sm:px-7 md:px-7 lg:px-8 py-3 sm:py-3 md:py-3 lg:py-3.5 bg-[#6343D6] text-white font-semibold rounded-xl transition-all duration-300 w-auto sm:w-auto text-sm md:text-sm lg:text-base outline-none focus:outline-none focus:ring-0"
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
