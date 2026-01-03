"use client";

import { cn } from "@/lib/utils";

export function AnimatedBackground() {
  return (
    <div className="z-[-1] fixed inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-[var(--deep-void)]">
        <div className="top-0 -left-4 absolute bg-[var(--cotton-blue)] opacity-30 blur-3xl rounded-full w-96 h-96 animate-blob animate-hue mix-blend-multiply filter"></div>
        <div className="top-0 -right-4 absolute bg-[var(--cotton-pink)] opacity-30 blur-3xl rounded-full w-96 h-96 animate-blob animate-hue animation-delay-2000 mix-blend-multiply filter"></div>
        <div className="-bottom-8 left-20 absolute bg-purple-500 opacity-30 blur-3xl rounded-full w-96 h-96 animate-blob animate-hue animation-delay-4000 mix-blend-multiply filter"></div>
      </div>
      
      {/* Frosted Glass Overlay - Creates the "Wax/Fog" effect */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[100px]"></div>
    </div>
  );
}
