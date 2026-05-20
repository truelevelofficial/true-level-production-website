"use client";

import { useActionState, useState } from "react";
import { logoutAction } from "@/lib/actions";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [, logout] = useActionState(logoutAction, undefined);

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-[#06111F]/15 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        {email}
        <svg className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#06111F]/10 bg-white p-2 shadow-xl">
          <a
            className="block rounded-xl px-4 py-3 text-sm font-bold text-[#06111F]/75 transition hover:bg-[#F7F8FB] hover:text-[#06111F]"
            href="/account"
            onClick={() => setOpen(false)}
          >
            Account Settings
          </a>
          <a
            className="block rounded-xl px-4 py-3 text-sm font-bold text-[#06111F]/75 transition hover:bg-[#F7F8FB] hover:text-[#06111F]"
            href="/account"
            onClick={() => setOpen(false)}
          >
            My Bookings
          </a>
          <hr className="my-1 border-[#06111F]/10" />
          <form action={logout}>
            <button
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
