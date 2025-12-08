import React, { useMemo } from 'react';
import { Smartphone, Layout, Watch, AppWindow, MousePointer2, RectangleGogglesIcon } from 'lucide-react';

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
      iconColor: '#0284C7',
      iconPosition: 'bottom-right',
      desktopPosition: 'top-[16%] left-[11%]',
      mobilePosition: 'top-[1%] left-[5%]',
      rotate: '-8deg',
      animationPath: 'circular-top-left',
      border: '#2BB6FF',
      pointrot: 'rotate-180',
      pointfill: '#2BB6FF'
    },
    {
      name: 'AR/VR',
      Icon: RectangleGogglesIcon,
      bg: '#FCECFF',
      iconColor: '#BE185D',
      iconPosition: 'bottom-right',
      desktopPosition: 'top-[16%] left-[32%]',
      mobilePosition: 'top-[1%] left-[38%]',
      rotate: '6deg',
      animationPath: 'circular-top-center',
      border: '#B13BC7',
      pointrot: 'rotate-180',
      pointfill: '#B13BC7'
    },
    {
      name: 'Web App',
      Icon: Layout,
      bg: '#FFF7E6',
      iconColor: '#D97706',
      iconPosition: 'bottom-left',
      desktopPosition: 'top-[22%] left-[50%]',
      mobilePosition: 'top-[2%] right-[5%]',
      rotate: '10deg',
      animationPath: 'circular-top-right',
      border: '#E69B0C',
      pointrot: 'rotate-[-95deg]',
      pointfill: '#E69B0C'
    },
    {
      name: 'Mobile App',
      Icon: Smartphone,
      bg: '#E8E4FF',
      iconColor: '#1D4ED8',
      iconPosition: 'top-right',
      desktopPosition: 'bottom-[20%] left-[25%]',
      mobilePosition: 'bottom-[32%] left-[5%]',
      rotate: '7deg',
      mobileRotate: '-25deg',
      animationPath: 'circular-bottom-left',
      border: '#8E79FF',
      pointrot: 'rotate-[70deg]',
      pointfill: '#8E79FF'

    },
    {
      name: 'Smartwatch',
      Icon: Watch,
      bg: '#FFEBE9',
      iconColor: '#15803D',
      iconPosition: 'top-left',
      desktopPosition: 'bottom-[28%] left-[45%]',
      mobilePosition: 'bottom-[32%] right-[5%]',
      rotate: '-6deg',
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
            transform: translateY(30%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .hero-image-container {
          animation: slideUpImage 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

        .category-badge {
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: badgeCircularAppear 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .category-badge:nth-child(1) {
          animation-delay: 0.3s;
        }
        .category-badge:nth-child(2) {
          animation-delay: 0.5s;
        }
        .category-badge:nth-child(3) {
          animation-delay: 0.7s;
        }
        .category-badge:nth-child(4) {
          animation-delay: 0.9s;
        }
        .category-badge:nth-child(5) {
          animation-delay: 1.1s;
        }

        @keyframes badgeCircularAppear {
          0% {
            opacity: 0;
            transform: translate(var(--start-x), var(--start-y)) scale(0.5) rotate(var(--rotate-start));
          }
          60% {
            transform: translate(0, 0) scale(1.05) rotate(var(--rotate-mid));
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(var(--rotate-end));
          }
        }

        .circular-top-left {
          --start-x: -120px;
          --start-y: -80px;
          --rotate-start: -45deg;
          --rotate-mid: -12deg;
          --rotate-end: -8deg;
        }

        .circular-top-center {
          --start-x: 0px;
          --start-y: -120px;
          --rotate-start: 20deg;
          --rotate-mid: 12deg;
          --rotate-end: 11deg;
        }

        .circular-top-right {
          --start-x: 120px;
          --start-y: -80px;
          --rotate-start: -20deg;
          --rotate-mid: -8deg;
          --rotate-end: 6deg;
        }

        .circular-bottom-left {
          --start-x: -100px;
          --start-y: 100px;
          --rotate-start: 25deg;
          --rotate-mid: 10deg;
          --rotate-end: 7deg;
        }

        .circular-bottom-right {
          --start-x: 100px;
          --start-y: 100px;
          --rotate-start: -25deg;
          --rotate-mid: -10deg;
          --rotate-end: -6deg;
        }

        .content-fade-in {
          animation: contentFadeIn 1s ease-out 0.5s forwards;
          opacity: 0;
        }

        @keyframes contentFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
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
          .mobile-badge-4 { bottom: 32%; left: 5%; }
          .mobile-badge-5 { bottom: 32%; right: 5%; }
        }

        /* Desktop positioning for badges */
        @media (min-width: 769px) {
          .desktop-badge-1 { top: 16%; left: 11%; }
          .desktop-badge-2 { top: 16%; left: 32%; }
          .desktop-badge-3 { top: 22%; left: 50%; }
          .desktop-badge-4 { bottom: 20%; left: 25%; }
          .desktop-badge-5 { bottom: 28%; left: 45%; }
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
            className={`category-badge ${category.animationPath} flex absolute items-center gap-1.5 sm:gap-2 md:gap-3 px-2.5 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 rounded-full z-20 flex-row mobile-badge-${idx + 1} desktop-badge-${idx + 1}`}
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
            `}</style>
            <MousePointer2
              fill={category.pointfill}
              className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transform ${category.pointrot} text-white flex-shrink-0 ${pointerPosition}`}
            />

            <category.Icon
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0`}
              style={{
                color: category.iconColor,
              }}
            />
            <span
              className="text-xs sm:text-base md:text-base font-normal whitespace-nowrap"
              style={{ color: category.iconColor }}
            >
              {category.name}
            </span>
          </div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 max-w-[1900px] mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="flex flex-col items-center md:items-start justify-center text-left space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 ml-0 sm:ml-4 md:ml-8 lg:ml-12 xl:ml-20 content-fade-in" style={{ maxWidth: '900px' }}>
          {/* Badge */}
          <div className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F8F9FC] backdrop-blur-sm border border-[#E5E7EB]">
            <span className="text-[#7C3AED] text-xs md:text-sm font-semibold">New</span>
            <span className="text-[#6B7280] text-xs md:text-sm font-normal">5000+ microinteractions just landed</span>
          </div>

          {/* Heading */}
<h1
  className="
    text-center md:text-left
    font-extrabold md:font-bold
    leading-tight
    text-4xl md:text-[clamp(1.5rem,5vw,3.75rem)]
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
        <span className="gradient-text hidden md:inline"> UI Animation &</span>
        <br className="hidden md:block" />
        <span className="gradient-text md:hidden">UI Animation &<br /></span>
        <span className="gradient-text">Micro-Interaction</span>
        <span className="text-muted"> Design</span>
    </span>

    </h1>




          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#6B7280] leading-relaxed max-w-[280px] sm:max-w-xl md:max-w-2xl font-normal text-center md:text-left">
            A curated, evolving library of the world's best UI animations. Stream inspiration, study motion systems, and design experiences users feel.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center md:items-start sm:items-center gap-4 sm:gap-5 pt-2 w-full">
            <button
              onClick={handleBookmark}
              className="group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-[#6343D6] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#231C50]/30 w-auto sm:w-auto text-sm sm:text-base"
            >
              <span className="relative z-10 font-semibold">Bookmark Now</span>
            </button>

            {/* User Avatars */}
            <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex -space-x-2 sm:-space-x-3">
                {avats.map((avat, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full border-2 border-white overflow-hidden bg-white flex-shrink-0 shadow-sm"
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
                <span className="text-[#9C9EBA] text-sm sm:text-base md:text-base font-semibold whitespace-nowrap md:whitespace-nowrap">
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
