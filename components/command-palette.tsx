"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

const quickActions = [
  { label: "New Client", href: "/admin/clients" },
  { label: "New Meeting", href: "/admin/meetings" },
  { label: "New Project", href: "/admin/workflow" },
  { label: "New Task", href: "/admin/workflow" },
  { label: "New Invoice", href: "/admin/accounting" },
];

const searchCategories = [
  { label: "Search Clients", href: "/admin/search?q=", prefix: "clients" },
  { label: "Search Projects", href: "/admin/search?q=", prefix: "projects" },
  { label: "Search Contracts", href: "/admin/search?q=", prefix: "contracts" },
  { label: "Search Quotations", href: "/admin/search?q=", prefix: "quotations" },
  { label: "Search Meetings", href: "/admin/search?q=", prefix: "bookings" },
  { label: "Search Tasks", href: "/admin/search?q=", prefix: "tasks" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"search" | "create">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    closePalette();
  }, [query, router]);

  const navigateTo = useCallback((href: string) => {
    router.push(href);
    closePalette();
  }, [router]);

  function closePalette() {
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-2 text-xs text-[#06111F]/40 transition hover:border-[#0B7CFF]/40 hover:text-[#06111F]/70"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Search <kbd className="ml-1 rounded-md border border-[#06111F]/10 bg-white px-1.5 py-0.5 text-[9px] font-bold">⌘K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" onClick={closePalette}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl rounded-2xl border border-[#06111F]/10 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="border-b border-[#06111F]/10 px-4 pt-4">
              <form onSubmit={handleSearch}>
                <input
                  ref={inputRef}
                  className="w-full rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-3 text-sm text-[#06111F] outline-none transition focus:border-[#0B7CFF] focus:ring-4 focus:ring-[#0B7CFF]/10"
                  placeholder="Type to search everything..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </form>
              <div className="mt-3 flex gap-1">
                <button
                  onClick={() => setTab("search")}
                  className={`rounded-t-lg px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition ${tab === "search" ? "border-b-2 border-[#0B7CFF] text-[#0B7CFF]" : "text-[#06111F]/40 hover:text-[#06111F]/70"}`}
                >
                  Search
                </button>
                <button
                  onClick={() => setTab("create")}
                  className={`rounded-t-lg px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition ${tab === "create" ? "border-b-2 border-[#0B7CFF] text-[#0B7CFF]" : "text-[#06111F]/40 hover:text-[#06111F]/70"}`}
                >
                  Quick Create
                </button>
              </div>
            </div>

            <div className="p-4">
              {tab === "search" ? (
                <div className="space-y-1">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#06111F]/30">Search categories</p>
                  {searchCategories.map(cat => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        const href = query.trim() ? `/admin/search?q=${encodeURIComponent(query.trim())}` : `/admin/search?q=${cat.prefix}`;
                        router.push(href);
                        closePalette();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#06111F]/60 transition hover:bg-[#06111F]/5 hover:text-[#06111F]"
                    >
                      <svg className="h-4 w-4 text-[#06111F]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      {cat.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#06111F]/30">Quick create</p>
                  {quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => navigateTo(action.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#06111F]/60 transition hover:bg-[#06111F]/5 hover:text-[#06111F]"
                    >
                      <svg className="h-4 w-4 text-[#06111F]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#06111F]/10 px-4 py-2.5">
              <p className="text-[10px] text-[#06111F]/30">
                <kbd className="rounded border border-[#06111F]/10 bg-[#F7F8FB] px-1 py-0.5 text-[9px] font-bold">↑↓</kbd> Navigate{' '}
                <kbd className="rounded border border-[#06111F]/10 bg-[#F7F8FB] px-1 py-0.5 text-[9px] font-bold">Enter</kbd> Select{' '}
                <kbd className="rounded border border-[#06111F]/10 bg-[#F7F8FB] px-1 py-0.5 text-[9px] font-bold">Esc</kbd> Close
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
