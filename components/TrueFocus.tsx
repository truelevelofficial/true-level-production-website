"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import "./TrueFocus.css";

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  noBorder?: boolean;
}

export default function TrueFocus({
  sentence = "True Level",
  manualMode = false,
  blurAmount = 2,
  borderColor = "#1683ff",
  glowColor = "rgba(22, 131, 255, 0.35)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1.5,
  noBorder = false,
}: TrueFocusProps) {
  const chars = sentence.split("");
  const [focusPos, setFocusPos] = useState(0);
  const directionRef = useRef(1);

  useEffect(() => {
    if (manualMode) return;

    const stepTime = (animationDuration * 1000) / chars.length;

    const id = setInterval(() => {
      setFocusPos((prev) => {
        const next = prev + directionRef.current;
        if (next >= chars.length - 1) {
          directionRef.current = -1;
          return chars.length - 1;
        }
        if (next <= 0) {
          directionRef.current = 1;
          return 0;
        }
        return next;
      });
    }, stepTime);

    return () => clearInterval(id);
  }, [manualMode, chars.length, animationDuration]);

  if (noBorder) {
    return (
      <span className="truefocus-inline">
        <span className="truefocus__track">
          {chars.map((ch, i) => {
            const dist = Math.abs(i - focusPos);
            const blur = Math.min(dist, 6) * blurAmount;
            const opacity = Math.max(0.25, 1 - dist * 0.12);
            return (
              <span
                key={i}
                className="truefocus__char"
                style={{
                  filter: `blur(${blur}px)`,
                  opacity,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            );
          })}
        </span>
      </span>
    );
  }

  return (
    <motion.div
      className="truefocus"
      style={{ borderColor }}
      animate={{
        boxShadow: [
          `0 0 20px ${glowColor}`,
          `0 0 32px ${glowColor}`,
          `0 0 20px ${glowColor}`,
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="truefocus__track">
        {chars.map((ch, i) => {
          const dist = Math.abs(i - focusPos);
          const blur = Math.min(dist, 6) * blurAmount;
          const opacity = Math.max(0.25, 1 - dist * 0.12);
          return (
            <span
              key={i}
              className="truefocus__char"
              style={{
                filter: `blur(${blur}px)`,
                opacity,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
