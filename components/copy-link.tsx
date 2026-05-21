"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-[#0B7CFF]/5 p-3">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Google Meet</span>
      <a className="break-all text-sm font-bold text-[#0B7CFF] underline" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      <button className="rounded-full bg-[#0B7CFF] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white" onClick={handleCopy} type="button">{copied ? "Copied!" : "Copy"}</button>
    </div>
  );
}
