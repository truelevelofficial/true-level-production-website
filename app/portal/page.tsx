"use client";

import { useActionState } from "react";
import { portalLoginAction } from "@/lib/actions";

export default function PortalLoginPage() {
  const [state, formAction, pending] = useActionState(portalLoginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Production</p>
            <p className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">Client Portal</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-3 text-sm outline-none transition focus:border-[#0B7CFF] focus:ring-4 focus:ring-[#0B7CFF]/10"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-3 text-sm outline-none transition focus:border-[#0B7CFF] focus:ring-4 focus:ring-[#0B7CFF]/10"
              />
            </div>

            {state?.error && (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600">{state.error}</p>
            )}

            <button
              disabled={pending}
              className="w-full rounded-full bg-[#0B7CFF] py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] disabled:opacity-50"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#06111F]/30">Access your projects, deliverables, and documents.</p>
      </div>
    </div>
  );
}
