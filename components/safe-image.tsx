"use client";

import { useState } from "react";

const gradients: Record<string, string> = {
  blue: "bg-gradient-to-br from-[#0B7CFF]/20 to-[#06111F]/10",
  warm: "bg-gradient-to-br from-amber-200/40 to-orange-300/20",
  dark: "bg-gradient-to-br from-[#06111F]/20 to-[#0B7CFF]/10",
  light: "bg-gradient-to-br from-white to-[#0B7CFF]/5",
};

export function SafeImage({
  src,
  alt,
  className = "",
  fallback = "blue",
  icon,
  contain,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: keyof typeof gradients;
  icon?: React.ReactNode;
  contain?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center ${gradients[fallback] || gradients.blue} ${className}`}>
        {icon || <span className="text-4xl font-black uppercase tracking-[-0.05em] text-[#06111F]/20">{alt.slice(0, 2)}</span>}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className={`absolute inset-0 ${gradients[fallback] || gradients.blue} animate-pulse`} />
      )}
      <img
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${contain ? "object-contain p-4" : ""}`}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        src={src}
      />
    </div>
  );
}
