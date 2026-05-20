import { ReactNode } from "react";
import Link from "next/link";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#06111F]/70">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full rounded-2xl border border-[#06111F]/10 bg-white px-4 py-3 text-[#06111F] outline-none transition focus:border-[#0B7CFF] focus:ring-4 focus:ring-[#0B7CFF]/10";

export function PageShell({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-10 text-[#06111F]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]" href="/">True Level Production</Link>
        <section className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">{eyebrow}</p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#06111F]/60">{text}</p>
        </section>
        {children}
      </div>
    </main>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return <button className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">{children}</button>;
}
