"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-2.5 text-xs text-[#06111F]/40 transition hover:border-[#0B7CFF]/40 hover:text-[#06111F]/70"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Search <kbd className="ml-1 rounded-md border border-[#06111F]/10 bg-white px-1.5 py-0.5 text-[9px] font-bold">⌘K</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="w-full rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-3 text-sm text-[#06111F] outline-none transition focus:border-[#0B7CFF] focus:ring-4 focus:ring-[#0B7CFF]/10"
                placeholder="Search projects, clients, bookings, quotations..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Projects", "Clients", "Bookings", "Quotations", "Contracts", "Tasks"].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    router.push(`/admin/search?q=${cat.toLowerCase()}`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="rounded-full border border-[#06111F]/10 px-3 py-1 text-[10px] font-bold text-[#06111F]/50 transition hover:border-[#0B7CFF]/40 hover:text-[#0B7CFF]"
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-[#06111F]/30">Press Enter to search all, Esc to close</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
