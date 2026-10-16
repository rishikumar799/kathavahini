import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

/**
 * Universal Brand Logo Component
 * - Automatically displays /logo.png uploaded to /public
 * - Elegantly formatted with crisp circular badge framing & drop shadow
 * - Gracefully falls back to stylized Telugu 'క' lettermark if image fails to load
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'కథావాహిని లోగో (Kathavahini Logo)',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-sm rounded-lg',
    sm: 'w-9 h-9 text-lg rounded-xl',
    md: 'w-11 h-11 text-2xl rounded-2xl',
    lg: 'w-14 h-14 text-3xl rounded-2xl',
    xl: 'w-20 h-20 text-4xl rounded-3xl',
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  if (!imageFailed) {
    return (
      <div 
        className={`relative flex items-center justify-center overflow-hidden shrink-0 rounded-2xl bg-white dark:bg-[#1A1822] shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-0.5 transition-transform ${containerSize} ${className}`}
      >
        <img
          src="/logo.png"
          alt={alt}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  // Graceful fallback to Telugu typography mark
  return (
    <div
      className={`bg-[#7A284B] dark:bg-[#D87591] text-white flex items-center justify-center font-serif-telugu font-bold shadow-md shrink-0 transition-transform ${containerSize} ${className}`}
      aria-label={alt}
    >
      క
    </div>
  );
};
