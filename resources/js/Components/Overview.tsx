import React from 'react';
import { Smartphone, Globe, Monitor, Glasses, Watch, WatchIcon } from 'lucide-react';

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface OverviewProps {
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  total: number;
}

const Overview: React.FC<OverviewProps> = ({
  filters,
  total,
}) => {
  // Responsive display counts - fewer on laptop, more on large desktop
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust counts based on screen size
  const industryCount = windowWidth >= 1536 ? 11 : windowWidth >= 1024 ? 6 : 11;
  const interactionCount = windowWidth >= 1536 ? 14 : windowWidth >= 1024 ? 7 : 14;

  const displayIndustries = filters.industries.slice(0, industryCount);
  const displayInteractions = filters.interactions.slice(0, interactionCount);

  // Platform icons mapping
  const platformIcons: { [key: string]: any } = {
    'mobile': Smartphone,
    'website': Globe,
    'webapp': Monitor,
    'web app': Monitor,
    'arvr': Glasses,
    'ar/vr': Glasses,
    'watch': Watch,
    'smartwatch': WatchIcon,
  };

  const getPlatformIcon = (slug: string, name: string) => {
    const key = slug.toLowerCase().replace(/[^a-z]/g, '');
    const nameKey = name.toLowerCase().replace(/[^a-z]/g, '');
    const Icon = platformIcons[key] || platformIcons[nameKey] || Smartphone;
    return Icon;
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-12 px-4">
        <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl !font-bold text-[#251C64] mb-3 md:mb-4 leading-tight">
          Designed to inspire,<br />built for action
        </h1>
        <p className="font-poppins text-[#828287] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Explore 3,000+ real UI animations curated from leading<br className="hidden md:block" />
          digital products to spark your next idea.
        </p>
      </div>

      {/* Three Column Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Apps Section - Left Column */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E3E2FF]">
            <h2 className="font-sora text-2xl sm:text-3xl !font-bold text-[#443B82] mb-2 md:mb-3">
              {filters.categories.length}+ Apps You Use Daily
            </h2>
            <p className="font-poppins text-[#828287] text-sm md:text-base mb-6 md:mb-8">
              Save your favorite animations, organize by theme,<br className="hidden sm:block" />
              and share boards with your team
            </p>

            {/* Image Placeholder for App Screenshots */}
            <div className="-mt-4 h-60 sm:h-72 md:h-80 -mr-6 md:-mr-8 -mb-6 md:-mb-8 overflow-hidden rounded-br-2xl shadow-[2px_-1px_32px_-5px_#EA40FD1F,-2px_1px_32px_-5px_#6D33D91F] rounded-lg">
              <img
                src="/images/others/apps.png"
                alt="App Icons"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Create & Share Boards - Right Column */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E3E2FF]">
            <h2 className="font-sora text-2xl sm:text-3xl !font-bold text-[#443B82] mb-2 md:mb-3">
              Create & Share Boards
            </h2>
            <p className="font-poppins text-[#828287] text-sm md:text-base mb-6 md:mb-8">
              Save your favorite animations, organize by theme,<br className="hidden sm:block" />
              and share boards with your team
            </p>

            <div className="-mt-4 h-60 sm:h-72 md:h-80 -mr-6 md:-mr-8 -mb-6 md:-mb-8 overflow-hidden rounded-br-2xl shadow-[2px_-1px_32px_-5px_#EA40FD1F,-2px_1px_32px_-5px_#6D33D91F] rounded-lg">
              <img
                src='images/others/c&sb.png'
                alt="Create and Share Boards"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Three Column Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
          {/* Industries Section */}
          <div className="bg-[#DEF0FC] rounded-2xl p-6 md:p-8 relative overflow-hidden border border-[#E3E2FF]">
            <h2 className="font-sora text-2xl sm:text-3xl !font-bold text-[#443B82] mb-2 md:mb-3">
              {filters.industries.length}+ Industries
            </h2>
            <p className="font-poppins text-[#5E727E] text-xs sm:text-sm mb-4 md:mb-6">
              Save your favorite animations, organize<br className="hidden sm:block" />
              by theme, and share boards with your
            </p>

            <div className="flex flex-wrap gap-2 relative z-[1]">
              {displayIndustries.map((industry) => (
                <span
                  key={industry.id}
                  className="font-sora px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-[4px] text-xs sm:text-sm text-[#5E54AB] border border-gray-200"
                >
                  {industry.name}
                </span>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50 via-transparent to-transparent pointer-events-none z-[2]"></div>
          </div>

          {/* Interactions Section */}
          <div className="bg-[#ECDBFC] rounded-2xl p-6 md:p-8 relative overflow-hidden border border-[#E3E2FF]">
            <h2 className="font-sora text-2xl sm:text-3xl !font-bold text-[#443B82] mb-2 md:mb-3">
              {total}+ Interactions
            </h2>
            <p className="font-poppins text-[#7A5D93] text-xs sm:text-sm mb-4 md:mb-6">
              Save your favorite animations, organize<br className="hidden sm:block" />
              by theme, and share boards with your
            </p>

            <div className="flex flex-wrap gap-2 relative z-[1]">
              {displayInteractions.map((interaction) => (
                <span
                  key={interaction.id}
                  className="font-sora px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-[4px] text-xs sm:text-sm text-gray-700 border border-gray-200"
                >
                  {interaction.name}
                </span>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-50 via-transparent to-transparent pointer-events-none z-[2]"></div>
          </div>

          {/* Platforms Section */}
          <div className="bg-[#EFF5E6] rounded-2xl p-6 md:p-8 border border-[#E3E2FF]">
            <h2 className="font-sora text-2xl sm:text-3xl !font-bold text-[#443B82] mb-2 md:mb-3">
              Major Platforms
            </h2>
            <p className="font-poppins text-[#71736F] text-xs sm:text-sm mb-4 md:mb-6">
              Save your favorite animations, organize<br className="hidden sm:block" />
              by theme, and share boards with your
            </p>

            <div className="flex flex-wrap gap-2">
              {filters.platforms.map((platform) => {
                const Icon = getPlatformIcon(platform.slug, platform.name);
                return (
                  <span
                    key={platform.id}
                    className="font-sora px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E3EBD8] rounded-[4px] text-xs sm:text-sm text-[#1E2D08] border border-gray-200 flex items-center gap-2"
                  >
                    <span className='bg-white p-1.5 sm:p-2 rounded-full'>
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                    </span>
                    {platform.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
