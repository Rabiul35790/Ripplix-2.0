import React, { useEffect, useRef } from 'react';

interface GoogleAdSlotProps {
  client: string;
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid';
  responsive?: boolean;
}

const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  client,
  slot,
  className,
  style,
  format,
  responsive = true,
}) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initializedRef.current = true;
    } catch (_error) {
      // Keep the UI stable even if Google script is blocked.
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`.trim()}
      style={style || { display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      {...(format ? { 'data-ad-format': format } : {})}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
};

export default GoogleAdSlot;
