import React from 'react';

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
  return (
    <div className="w-full">
      <div className="relative bg-[#080921] dark:bg-gray-900 overflow-hidden">
        {settings?.hero_image && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.hero_image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 xl:py-40 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-sora text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl !font-bold text-[#2B235A] mb-6 sm:mb-8 leading-tight">
              <span className="block mb-2">A Curated library of</span>
              <span className="block mb-2">UI Animation to make</span>
              <span className="block">your product more delightful</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4" style={{ color: '#7F7F8A' }}>
              Discover. Inspire. Implement.<br/>
              Ripplix - Inspiring for better Interactions
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if ('sidebar' in window && typeof (window as any).sidebar === 'object') {
                    (window.sidebar as any).addPanel?.(document.title, window.location.href, '');
                  } else if ((window as any).external?.AddFavorite) {
                    (window as any).external.AddFavorite(window.location.href, document.title);
                  } else {
                    alert('Please bookmark this page by pressing Ctrl+D (Cmd+D on Mac)');
                  }
                }
              }}
              className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-4 sm:px-6 py-3 rounded-lg !font-sora !font-medium text-base sm:text-lg hover:opacity-95 transition-opacity whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
            >
              <span className='z-10'>Bookmark Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
