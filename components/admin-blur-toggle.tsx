"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "truelevel_admin_blur_mode";

export function AdminBlurToggle() {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) === "true";
    setBlurred(stored);
    document.documentElement.classList.toggle("admin-blur-mode", stored);
  }, []);

  function toggle() {
    const next = !blurred;
    setBlurred(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    document.documentElement.classList.toggle("admin-blur-mode", next);
  }

  return (
    <button
      className={`ml-2 rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition ${
        blurred
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
          : "border border-[#06111F]/10 text-[#06111F]/50 hover:border-[#0B7CFF] hover:text-[#0B7CFF]"
      }`}
      onClick={toggle}
    >
      {blurred ? "Unblur" : "Blur"}
    </button>
  );
}
