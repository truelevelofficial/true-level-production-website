"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-full border border-[#06111F]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
