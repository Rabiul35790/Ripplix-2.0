import React, { useState, useEffect, useRef } from 'react';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const gifs = [
    '/images/Gif/amoweb.gif',
    '/images/Gif/dayweb.gif',
    '/images/Gif/mobday.gif',
    '/images/Gif/rainmob.gif',
    '/images/Gif/scrollwatch.gif',
    '/images/Gif/shopmob.gif',
    '/images/Gif/squarewapp.gif'
  ];

  const avats = [
    'images/hero/tes1.jpg',
    'images/hero/tes2.jpg',
    'images/hero/tes3.jpg',
  ];

  const colors = [
    'from-purple-200 to-purple-300',
    'from-pink-200 to-pink-300',
    'from-cyan-200 to-cyan-300',
    'from-orange-200 to-orange-300',
    'from-blue-200 to-blue-300',
    'from-green-200 to-green-300',
    'from-yellow-200 to-yellow-300'
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % gifs.length);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gifs.length]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + gifs.length) % gifs.length;

    const positions = {
      0: { y: -50, x: -50, scale: 1, opacity: 1, z: 50 },
      1: { y: -35, x: -50, scale: 0.85, opacity: 1, z: 30 },
      2: { y: -25, x: -50, scale: 0.70, opacity: 1, z: 25 },
      3: { y: -15, x: -50, scale: 0.55, opacity: 1, z: 20 },
      4: { y: -85, x: -50, scale: 0.55, opacity: 1, z: 35 },
      5: { y: -75, x: -50, scale: 0.70, opacity: 1, z: 40 },
      6: { y: -65, x: -50, scale: 0.85, opacity: 1, z: 45 }
    };

    const pos = positions[position as keyof typeof positions] || { y: -5, x: -50, scale: 0.40, opacity: 0, z: 15 };

    return {
      transform: `translateY(${pos.y}%) translateX(${pos.x}%) scaleX(${pos.scale})`,
      opacity: pos.opacity,
      zIndex: pos.z
    };
  };

  const handleBookmark = () => {
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D';
      alert(`Please bookmark this page by pressing ${shortcut}`);
    }
  };

  return (
    <div className="w-full min-h-[90vh] bg-[#080921] relative overflow-hidden flex items-center">
      {/* Background */}
      {settings?.hero_image && (
        <div className="absolute inset-0 z-0">
          <img
            src={settings.hero_image}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .card-transition {
          transition: transform 1000ms cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1),
                      z-index 0ms;
        }
      `}</style>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-14 lg:gap-16 xl:gap-20 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="text-left space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8 flex flex-col items-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#080921] border border-[#858B984D]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px]">
                <path d="M7.50873 6.03634C7.45433 5.91134 7.33433 5.83301 7.20393 5.83301C7.07433 5.83301 6.95433 5.91134 6.89993 6.03634L5.79352 8.53134L3.39832 9.68134C3.27832 9.73801 3.20312 9.86301 3.20312 10.0005C3.20312 10.1388 3.27832 10.2613 3.39832 10.318L5.79352 11.4705L6.89753 13.963C6.95193 14.0872 7.07192 14.1663 7.20232 14.1663C7.33192 14.1663 7.45192 14.0872 7.50632 13.963L8.61273 11.468L11.0079 10.3155C11.1271 10.2588 11.2031 10.1338 11.2031 9.99884C11.2031 9.86301 11.1271 9.73801 11.0079 9.68134L8.61513 8.53134L7.50873 6.03634Z" fill="#9943EE"/>
                <path opacity="0.52" d="M11.3552 5.18217L12.5328 4.72217L12.9744 3.49551C13.0096 3.39801 13.0992 3.33301 13.1992 3.33301C13.2992 3.33301 13.3888 3.39801 13.424 3.49551L13.8656 4.72217L15.0432 5.18217C15.1368 5.21884 15.1992 5.31217 15.1992 5.41634C15.1992 5.52051 15.1368 5.61384 15.0432 5.65051L13.8656 6.11051L13.424 7.33717C13.3888 7.43467 13.2992 7.49967 13.1992 7.49967C13.0992 7.49967 13.0096 7.43467 12.9744 7.33717L12.5328 6.11051L11.3552 5.65051C11.2616 5.61384 11.1992 5.52051 11.1992 5.41634C11.1992 5.31217 11.2616 5.21884 11.3552 5.18217Z" fill="#9943EE"/>
                <path opacity="0.52" d="M12.7992 13.3337L11.3864 13.8862C11.2744 13.9303 11.1992 14.042 11.1992 14.167C11.1992 14.292 11.2744 14.4037 11.3864 14.4478L12.7992 15.0003L13.3296 16.472C13.372 16.5887 13.4792 16.667 13.5992 16.667C13.7192 16.667 13.8264 16.5887 13.8688 16.472L14.3992 15.0003L15.812 14.4478C15.924 14.4037 15.9992 14.292 15.9992 14.167C15.9992 14.042 15.924 13.9303 15.812 13.8862L14.3992 13.3337L13.8688 11.862C13.8264 11.7453 13.7192 11.667 13.5992 11.667C13.4792 11.667 13.372 11.7453 13.3296 11.862L12.7992 13.3337Z" fill="#9943EE"/>
              </svg>
              <span className="text-[#9943EE] text-xs sm:text-sm font-medium">New</span>
              <span className="text-[#B6B5CC] text-xs sm:text-sm font-normal hidden sm:inline">50+ microinteractions just landed</span>
              <span className="text-[#B6B5CC] text-xs font-normal sm:hidden">50+ microinteractions</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] font-bold leading-tight sm:leading-[1.2] md:leading-[1.25] lg:leading-[68px] xl:leading-[78px] bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
              Your Creative Partner<br />
              in Motion Design
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl font-light">
              Curated, inspiring, and evolving — Ripplix helps designers discover
              and save the best motion patterns.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 lg:gap-6 pt-4 sm:pt-6 w-full">
              <button
                onClick={handleBookmark}
                className="group relative px-6 sm:px-7 py-3 sm:py-3 bg-[#9943EE] text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="relative z-10 text-base sm:text-lg font-semibold">Bookmark Now</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              </button>

              {/* User Avatars */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {avats.map((avat, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#CECCFF] overflow-hidden bg-[#CECCFF]"
                    >
                      <img
                        src={avat}
                        alt={`User ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[#BBBBBB] text-sm sm:text-[15px] lg:text-[16px] font-medium">35k+ Users Joined</span>
              </div>
            </div>
          </div>

          {/* Right - Animated Card Stack */}
          <div className="relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[520px] xl:h-[550px] flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full h-full lg:ml-8 xl:ml-24 xl:mr-[-8rem]">
              {gifs.map((gif, idx) => {
                const style = getCardStyle(idx);
                const colorIndex = idx % colors.length;
                const hasError = imageErrors[idx];

                return (
                  <div
                    key={idx}
                    className="card-transition absolute left-1/2 top-1/2 w-[90%] sm:w-[85%] md:w-[80%] max-w-[280px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden"
                    style={style}
                  >
                    <div className="w-full aspect-[20/15] rounded-lg sm:rounded-xl overflow-hidden bg-gray-900">
                      {!hasError ? (
                        <img
                          src={gif}
                          alt={`Motion pattern ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(idx)}
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
                          <div className="text-center p-6 sm:p-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/30 backdrop-blur-sm rounded-2xl mb-4 flex items-center justify-center shadow-lg">
                              <span className="text-white text-2xl sm:text-3xl font-bold">{idx + 1}</span>
                            </div>
                            <p className="text-white font-medium text-xs sm:text-sm">Motion Pattern {idx + 1}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
