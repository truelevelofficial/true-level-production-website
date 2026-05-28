"use client";

import { useState, useEffect } from "react";
import { SafeImage } from "./safe-image";

const slides = [
  { src: "/images/hero-production-01.jpg", alt: "Production set" },
  { src: "/images/hero-production-02.jpg", alt: "Studio session" },
  { src: "/images/hero-production-03.jpg", alt: "Content creation" },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[650px] max-lg:hidden">
      <div className="absolute -bottom-6 -left-6 -right-6 -top-6">
        {slides.map((slide, i) => (
          <div className={`absolute inset-0 transition-all duration-1000 ${i === current ? "scale-100 opacity-100" : "scale-110 opacity-0"}`} key={slide.src}>
            <SafeImage alt={slide.alt} className="h-full w-full rounded-[3.5rem]" fallback="blue" icon={<span className="text-8xl font-black uppercase tracking-[-0.06em] text-white/50">TL</span>} src={slide.src} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button className={`h-2 w-2 rounded-full transition-all ${i === current ? "w-6 bg-[#0B7CFF]" : "bg-white/60"}`} key={i} onClick={() => setCurrent(i)} type="button" />
        ))}
      </div>
      <div className="absolute left-2 top-8 z-10 -rotate-6 rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-blue-500/20">Cyclorama</div>
      <div className="absolute right-0 top-28 z-10 rotate-6 rounded-full border border-[#06111F]/10 bg-white/90 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#06111F] backdrop-blur">Set Locations</div>
      <div className="absolute bottom-16 left-10 z-10 rotate-3 rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">UGC Ready</div>
    </div>
  );
}
