import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface InFeedAd {
  id: number;
  title: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  media_url: string;
  target_url: string;
}

interface InFeedAdCardProps {
  ad: InFeedAd;
  cardSize?: 'normal' | 'large';
}

const InFeedAdCard: React.FC<InFeedAdCardProps> = ({ ad, cardSize = 'normal' }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleAdClick = async () => {
    // Track ad click
    try {
      await fetch(`/ads/${ad.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }

    // Open target URL
    window.open(ad.target_url, '_blank');
  };

  const getCardClasses = () => {
    return cardSize === 'large'
      ? 'rounded-xl'
      : 'rounded-lg';
  };

  const getVideoContainerClasses = () => {
    return cardSize === 'large'
      ? 'relative w-full aspect-[3/2.1] overflow-hidden rounded-t-xl cursor-pointer'
      : 'relative w-full aspect-[3/2.1] overflow-hidden rounded-t-lg cursor-pointer';
  };

  const getContentPadding = () => {
    return cardSize === 'large' ? 'px-6 py-5' : 'px-4 py-3';
  };

  const getTitleClasses = () => {
    return cardSize === 'large' ? 'text-xl' : 'text-lg';
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden group border border-transparent bg-transparent hover:bg-white transition-colors duration-500 ease-in-out hover:border-[#F2F2FF] ${getCardClasses()}`}
    >
      {/* Animated hover background */}
      <div className="absolute"></div>

      {/* Card content */}
      <div className="relative z-8">
        {/* Media section - clickable */}
        <div
          className={`${getVideoContainerClasses()}`}
          onClick={handleAdClick}
        >
          {/* Video */}
          {ad.media_type === 'video' && inView && ad.video_url && (
            <video
              ref={videoRef}
              src={ad.video_url}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={handleVideoLoad}
            />
          )}

          {/* Image */}
          {ad.media_type === 'image' && inView && ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover"
              onLoad={handleVideoLoad}
            />
          )}

          {/* Fallback loader */}
          {(!inView || !isVideoLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div
                className="flex items-center justify-center bg-[#F7F7FB] rounded-xl"
                style={{
                  width: 'calc(100% - 36px)',
                  height: 'calc(100% - 120px)',
                }}
              >
                <img
                  src="/images/Spin.gif"
                  height={60}
                  width={60}
                  alt="Loading..."
                />
              </div>
            </div>
          )}

          {/* Sponsored badge */}
          <div className="absolute top-3 right-3 bg-[#2B235A] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            Sponsored
          </div>
        </div>

        {/* Content - clickable */}
        <div className={getContentPadding()}>
          <div
            className="flex items-start gap-2 cursor-pointer"
            onClick={handleAdClick}
          >
            {/* Title and Sponsor label */}
            <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
              {/* Title */}
              <h3 className={`font-sora text-[#2B235A] !font-bold truncate ${getTitleClasses()}`}>
                {ad.title}
              </h3>

              {/* Sponsor text */}
              <div className="font-medium text-[#8787A8] opacity-70">
                <span className={`font-sora ${cardSize === 'large' ? 'text-base' : 'text-sm'}`}>
                  Sponsored
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InFeedAdCard;
