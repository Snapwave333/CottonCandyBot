"use client";

import React, { useState } from 'react';
import { MemeCoinFallback } from './meme-coin-fallback';
import { cn } from '@/lib/utils';

interface TokenImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackVariant?: 'cotton' | 'dark' | 'light';
  size?: number;
}

export function TokenImage({ 
  src, 
  alt, 
  className, 
  fallbackVariant = 'cotton',
  size = 40,
  ...props 
}: TokenImageProps) {
  const [error, setError] = useState(false);

  // Reset error state if src changes (e.g. reused component)
  React.useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <MemeCoinFallback 
        className={className} 
        variant={fallbackVariant}
        size={size}
      />
    );
  }

  // Prevent double proxying
  const isAlreadyProxied = typeof src === 'string' && src.includes('/api/proxy/image');
  const finalSrc = isAlreadyProxied 
      ? src 
      : `http://localhost:3021/api/proxy/image?url=${encodeURIComponent(src as string)}`;

  return (
    <img
      src={finalSrc}
      alt={alt || "Token Image"}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
      width={size}
      height={size}
      {...props}
    />
  );
}
