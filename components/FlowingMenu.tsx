"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import "./FlowingMenu.css";

interface FlowingMenuItem {
  link: string;
  text: string;
  image: string;
}

interface FlowingMenuProps {
  items?: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

const defaultItems: FlowingMenuItem[] = [
  { link: "/packages/studio-rent", text: "Studio Rent Package", image: "" },
  { link: "/packages/content-creators-campaign", text: "Content Creators Campaign", image: "" },
  { link: "/packages/event-production", text: "Event Production", image: "" },
  { link: "/packages/ugc-campaign", text: "UGC Campaign", image: "" },
  { link: "/packages/monthly-marketing-campaign", text: "Monthly Marketing Campaign", image: "" },
];

export default function FlowingMenu({
  items = defaultItems,
  speed = 16,
  textColor = "#07111f",
  bgColor = "#ffffff",
  marqueeTextColor = "#ffffff",
  borderColor = "rgba(7, 17, 31, 0.12)",
}: FlowingMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const getGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #0B7CFF 0%, #4A9EFF 50%, #7EB8FF 100%)",
      "linear-gradient(135deg, #06111F 0%, #1A2A3F 50%, #2D4159 100%)",
      "linear-gradient(135deg, #0B7CFF 0%, #063D7A 50%, #0B7CFF 100%)",
      "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFB347 100%)",
      "linear-gradient(135deg, #06111F 0%, #0B7CFF 50%, #4A9EFF 100%)",
    ];
    return gradients[index % gradients.length];
  };

  const setupMarquee = useCallback(
    (index: number) => {
      const marquee = marqueeRefs.current[index];
      if (!marquee) return;
      const text = items[index].text;
      const cloneCount = 8;
      marquee.innerHTML = "";
      for (let i = 0; i < cloneCount; i++) {
        const span = document.createElement("span");
        span.textContent = text;
        span.className = "flowing-menu__marquee-text";
        marquee.appendChild(span);
        if (i < cloneCount - 1) {
          const dot = document.createElement("span");
          dot.className = "flowing-menu__marquee-dot";
          dot.innerHTML = "●";
          marquee.appendChild(dot);
        }
      }
    },
    [items]
  );

  useEffect(() => {
    items.forEach((_, i) => setupMarquee(i));
  }, [items, setupMarquee]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    marqueeRefs.current.forEach((marquee, i) => {
      if (!marquee) return;
      const marqueeTexts = marquee.querySelectorAll(".flowing-menu__marquee-text");
      if (marqueeTexts.length) {
        tl.to(
          marqueeTexts,
          {
            xPercent: -50,
            duration: speed,
            ease: "none",
            repeat: -1,
          },
          0
        );
      }
    });

    return () => {
      tl.kill();
    };
  }, [items, speed]);

  const startMarquee = useCallback(
    (index: number) => {
      const marquee = marqueeRefs.current[index];
      if (!marquee) return;
      const marqueeTexts = marquee.querySelectorAll(".flowing-menu__marquee-text");
      marqueeTexts.forEach((mt) => {
        gsap.to(mt, {
          xPercent: -50,
          duration: speed,
          ease: "none",
          repeat: -1,
        });
      });
    },
    [speed]
  );

  const stopMarquee = useCallback((index: number) => {
    const marquee = marqueeRefs.current[index];
    if (!marquee) return;
    const marqueeTexts = marquee.querySelectorAll(".flowing-menu__marquee-text");
    marqueeTexts.forEach((mt) => {
      gsap.killTweensOf(mt);
      gsap.set(mt, { xPercent: 0 });
    });
  }, []);

  return (
    <div ref={containerRef} className="flowing-menu" style={{ color: textColor }}>
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          className="flowing-menu__item"
          style={{ borderColor, backgroundColor: bgColor }}
          onMouseEnter={() => startMarquee(i)}
          onMouseLeave={() => stopMarquee(i)}
        >
          <div className="flowing-menu__overlay" style={{ background: getGradient(i) }} />
          <div
            className="flowing-menu__marquee"
            ref={(el) => { marqueeRefs.current[i] = el; }}
            style={{ color: marqueeTextColor }}
          />
          <div className="flowing-menu__content">
            <span className="flowing-menu__number">0{i + 1}</span>
            <span className="flowing-menu__label">{item.text}</span>
            <span className="flowing-menu__arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
