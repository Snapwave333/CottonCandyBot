import React from 'react';
import { cn } from '@/lib/utils';

interface MemeCoinFallbackProps {
  className?: string;
  size?: number;
  variant?: 'cotton' | 'dark' | 'light';
}

export function MemeCoinFallback({ className, size = 40, variant = 'cotton' }: MemeCoinFallbackProps) {
  // Graceful color palettes based on "Cotton Candy" theme
  const gradients = {
    cotton: {
      from: '#FF99C8', // Cotton Pink
      to: '#A9DEF9',   // Cotton Blue
      accent: '#FFFFFF'
    },
    dark: {
      from: '#2D3748',
      to: '#1A202C',
      accent: '#718096'
    },
    light: {
      from: '#EDF2F7',
      to: '#E2E8F0',
      accent: '#CBD5E0'
    }
  };

  const colors = gradients[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("rounded-full select-none", className)}
      role="img"
      aria-label="Meme Coin Fallback Icon"
    >
      <defs>
        <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor={colors.from} />
          <stop offset="1" stopColor={colors.to} />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="32" cy="32" r="32" fill={`url(#gradient-${variant})`} />

      {/* Inner Ring (Subtle depth) */}
      <circle cx="32" cy="32" r="28" stroke="white" strokeOpacity="0.1" strokeWidth="2" />

      {/* Central "Meme Sparkle" Motif */}
      <g filter="url(#glow)">
        <path
          d="M32 12C32 12 36 24 48 28C60 32 48 36 48 36C48 36 36 40 32 52C28 40 16 36 16 36C16 36 28 32 32 12Z"
          fill={colors.accent}
        />
      </g>
    </svg>
  );
}
