import React, { useState } from 'react';

interface TeamLogoProps {
  logo?: string;
  fallback?: string;
  className?: string;
  alt?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  fallback = '⚽',
  className = 'w-5 h-5',
  alt = 'Logo'
}) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return <span className="inline-flex items-center justify-center shrink-0 select-none text-base">{fallback}</span>;
  }

  const cleanLogo = logo.trim();
  const isUrl = cleanLogo.startsWith('http://') || cleanLogo.startsWith('https://') || cleanLogo.startsWith('data:') || cleanLogo.startsWith('/');

  if (isUrl) {
    return (
      <img
        src={cleanLogo}
        alt={alt}
        className={`${className} object-contain inline-block shrink-0 rounded-full bg-[#161B22]/40 p-0.5`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }

  // If it's a long invalid string, don't print the raw text, use fallback
  if (cleanLogo.length > 8) {
    return <span className="inline-flex items-center justify-center shrink-0 select-none text-base">{fallback}</span>;
  }

  // If it's a short text/emoji (e.g. 🇹🇷, ⚽, 🏀, etc.)
  return <span className="inline-flex items-center justify-center shrink-0 select-none">{cleanLogo}</span>;
};

export default TeamLogo;
