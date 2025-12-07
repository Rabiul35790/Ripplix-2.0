import React, { useMemo } from 'react';
import { Monitor, Glasses, Smartphone, Layout, Watch, MousePointer2, AppWindow, RectangleGoggles } from 'lucide-react';

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
    { name: 'Website Animation', Icon: AppWindow, bg: '#7128DE', border: '#8533FF', mobilePosition: 'top-[12%] left-[2%]' },
    { name: 'AR/VR Animation', Icon: RectangleGoggles, bg: '#0B55A4', border: '#1570EF', mobilePosition: 'top-[3%] left-[50%] -translate-x-1/2' },
    { name: 'Mobile App Animation', Icon: Smartphone, bg: '#036A3A', border: '#039855', mobilePosition: 'bottom-[12%] left-[2%]' },
    { name: 'WebApp Animation', Icon: Layout, bg: '#AE2685', border: '#DD2590', mobilePosition: 'top-[12%] right-[2%]' },
    { name: 'Smartwatch Animation', Icon: Watch, bg: '#8A3E07', border: '#DC6803', mobilePosition: 'bottom-[12%] right-[2%]' }
  ], []);

  const handleBookmark = () => {
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D';
      alert(`Please bookmark this page by pressing ${shortcut}`);
    }
  };

  return (
    <div className="w-full min-h-[70vh] md:min-h-screen bg-[#080921] relative overflow-hidden flex items-center py-8 md:py-12">
      {/* Background */}
      {settings?.hero_image && (
        <div className="absolute inset-0 z-0">
          <img
            src={settings.hero_image}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      )}

    <style>{`
        .category-badge {
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: badgeAppear 0.8s ease-out forwards;
          opacity: 0;
        }
        .category-badge:nth-child(1) {
          animation-delay: 0.2s;
        }
        .category-badge:nth-child(2) {
          animation-delay: 0.4s;
        }
        .category-badge:nth-child(3) {
          animation-delay: 0.6s;
        }
        .category-badge:nth-child(4) {
          animation-delay: 0.8s;
        }
        .category-badge:nth-child(5) {
          animation-delay: 1s;
        }
        @keyframes badgeAppear {
          0% {
            opacity: 0;
            scale: 0.7;
          }
          60% {
            scale: 1.05;
          }
          100% {
            opacity: 1;
            scale: 1;
          }
        }
        .gradient-text {
          background: linear-gradient(90deg, #A5FAF5 0%, #97BBFF 26.44%, #BABCFF 62.5%, #C9DAF0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Floating Category Badges */}
      {categories.map((category, idx) => {
        const isARVR = idx === 1;
        const isWebsite = idx === 0;
        const isMobileApp = idx === 2;
        const isWebApp = idx === 3;
        const isSmartwatch = idx === 4;

        // Define large screen positions
        let largeScreenPosition = '';
        if (isWebsite) largeScreenPosition = 'xl:top-[15%] xl:left-[8%] 2xl:left-[25%]';
        else if (isARVR) largeScreenPosition = 'xl:top-[55%] xl:left-[14%] xl:-translate-y-1/2 xl:translate-x-0';
        else if (isMobileApp) largeScreenPosition = 'xl:bottom-[19%] xl:left-[8%] 2xl:left-[20%]';
        else if (isWebApp) largeScreenPosition = 'xl:top-[20%] xl:right-[8%] 2xl:right-[15%]';
        else if (isSmartwatch) largeScreenPosition = 'xl:bottom-[17%] xl:right-[8%] 2xl:right-[15%]';

        const baseClasses = `category-badge flex absolute items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-tr-lg sm:rounded-tr-xl md:rounded-tr-2xl rounded-br-lg sm:rounded-br-xl md:rounded-br-2xl rounded-bl-lg sm:rounded-bl-xl md:rounded-bl-2xl shadow-lg z-20 shadow-[4px_4px_10px_0px_#7CD4FD29]`;

        return (
          <div
            key={idx}
            className={`${baseClasses} ${category.mobilePosition} ${largeScreenPosition}`}
            style={{ backgroundColor: category.bg, border: `2px solid ${category.border}` }}
          >
            <MousePointer2 fill='#000000' className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-5 md:h-4 text-white flex-shrink-0 absolute -top-3 -left-3 sm:-top-3.5 sm:-left-3.5 md:-top-4 md:-left-4" />
            <category.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
            <span className="text-white text-[9px] sm:text-xs md:text-sm !font-medium whitespace-nowrap leading-tight">{category.name}</span>
          </div>
        );
      })}

      <div className="relative z-10 max-w-[1900px] mx-auto w-full px-4">
        <div className="flex flex-col items-center justify-center text-center space-y-3.5 sm:space-y-5 md:space-y-8 lg:space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#160E44] backdrop-blur-sm border border-[#858B984D] font-inter">
            <span className="text-[#FFFFFFCC] text-xs sm:text-sm !font-medium">New</span>
            <span className="text-[#FFFFFFCC] text-xs sm:text-sm !font-normal">5000+ microinteractions just landed</span>
          </div>

          {/* Heading */}
          <h1 className="font-sora text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl !font-bold leading-tight max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            {/* Mobile and Tablet (below lg) */}
            <span className="block lg:hidden">
              <span className="text-white">Your Netflix for </span>
              <span className="gradient-text">UI Animation &</span>
              <br />
              <span className="gradient-text">Micro-Interaction</span>
              <span className="text-white"> Design</span>
            </span>

            {/* Large devices (lg and above) */}
            <span className="hidden lg:block">
              <span className="text-white">Your Netflix for </span>
              <span className="gradient-text">UI Animation &</span>
              <br />
              <span className="gradient-text">Micro-Interaction</span>
              <span className="text-white"> Design</span>
            </span>
          </h1>

          {/* Description */}
          <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl xl:text-[22px] text-white/85 leading-relaxed max-w-3xl !font-light px-2 sm:px-6">
            A curated, evolving library of the world's best UI animations. Stream inspiration, study motion systems, and design experiences users feel.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 pt-2 sm:pt-4">
            <button
              onClick={handleBookmark}
              className="group holographic-link2 relative px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-[#080921] !font-semibold rounded-[12px] transition-all duration-500 shadow-[0_0_60px_10px_rgba(59,130,246,0.25)] outline-none focus:outline-none focus:ring-0 w-full sm:w-auto"
            >
              <span className="relative z-10 text-sm sm:text-base lg:text-lg font-sora !font-semibold">Bookmark Now</span>
            </button>

            {/* User Avatars */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex -space-x-2 sm:-space-x-2.5">
                {avats.map((avat, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 border-white overflow-hidden bg-white flex-shrink-0"
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
              <span className="font-inter text-white/90 text-sm sm:text-base lg:text-lg !font-medium whitespace-nowrap">35k+ Users Joined</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
