import React, { useState, useEffect } from 'react';
import { Building2, Image as ImageIcon } from 'lucide-react';

// Global in-memory image cache to track previously loaded URLs
const loadedImageCache = new Set<string>();

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
  thumbnail?: boolean;
  priority?: boolean;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'video',
  thumbnail = false,
  priority = false,
  fallbackIcon,
  fallbackText,
}) => {
  const isInitiallyLoaded = !!src && loadedImageCache.has(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(isInitiallyLoaded);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }
    if (loadedImageCache.has(src)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // Reset when src changes
    setIsLoaded(false);
    setHasError(false);

    // Preload image in memory
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImageCache.add(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const aspectClass = {
    video: 'aspect-16/10',
    square: 'aspect-square',
    portrait: 'aspect-3/4',
    wide: 'aspect-21/9',
    auto: '',
  }[aspectRatio];

  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center text-slate-400 p-4 select-none ${aspectClass} ${containerClassName}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#93F7BA] mb-1.5 shadow-xs">
          {fallbackIcon || <Building2 className="w-5 h-5 text-[#246BCE]" />}
        </div>
        <span className="text-[11px] font-medium text-slate-300 text-center line-clamp-1 max-w-[80%]">
          {alt || 'StayPass Accommodation'}
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5">Verified Property</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-200 ${aspectClass} ${containerClassName}`}>
      {/* Lightweight Shimmer / Blur Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-400 opacity-40 animate-pulse" />
        </div>
      )}

      {/* Actual Image with smooth fade-in */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
