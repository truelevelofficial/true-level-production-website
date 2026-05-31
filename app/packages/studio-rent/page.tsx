import { ArrowRight, CheckCircle2, Clock, Camera, Image, Mic, Monitor, Sun } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Rent Package | True Level Production",
  description:
    "Book True Level studio spaces for reels, product shoots, podcasts, and campaign content with ready-made production setups.",
};

const setups = [
  { icon: Camera, title: "Cyclorama", desc: "Clean curved wall studio for reels, product shoots, and campaigns." },
  { icon: Mic, title: "Podcast Setup", desc: "Cozy podcast-style setup with seating, mic, and warm background." },
  { icon: Image, title: "Product Zone", desc: "Product shooting setup for beauty, food, fashion, and e-commerce brands." },
  { icon: Monitor, title: "Creator Corner", desc: "Ready-made creator setups for talking-head reels and social content." },
  { icon: Sun, title: "Lifestyle Setups", desc: "Designed spaces for brand scenes, UGC, and lifestyle content." },
  { icon: Camera, title: "Lighting Ready", desc: "Flexible lighting setups for fast content production." },
];

const durations = [
  { label: "Hourly", time: "1 hour", desc: "Quick shoots, single scenes, or short reels." },
  { label: "Half Day", time: "4 hours", desc: "Multiple setups, product shots, or podcast recording." },
  { label: "Full Day", time: "8 hours", desc: "Full production day with multiple scene changes." },
];

const rules = [
  "Arrive 15 minutes before your booking for setup.",
  "No food or drinks near equipment and backdrops.",
  "Leave the space as you found it — clean and organized.",
  "Additional cleaning fees may apply for heavy setup changes.",
  "Equipment damage must be reported immediately.",
  "Overtime is billed in 30-minute increments.",
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default function StudioRentPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <Badge>Studio Space</Badge>
            <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Studio Rent Package</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#06111F]/58">Book ready-to-shoot studio spaces for reels, product shoots, podcasts, and campaign content.</p>
            <a href="/book?package=studio-rent" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] active:scale-95">
              Book Studio <ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-56 rounded-[2rem] bg-gradient-to-br from-[#0B7CFF]/30 to-[#0B7CFF]/5 md:h-72" />
            <div className="mt-8 h-56 rounded-[2rem] bg-gradient-to-br from-[#06111F]/20 to-[#0B7CFF]/10 md:h-72" />
            <div className="-mt-8 h-56 rounded-[2rem] bg-gradient-to-br from-[#0B7CFF]/20 to-[#06111F]/5 md:h-72" />
            <div className="h-56 rounded-[2rem] bg-gradient-to-br from-[#06111F]/30 to-[#0B7CFF]/5 md:h-72" />
          </div>
        </div>

        <div className="mt-24">
          <Badge>Available Setups</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-6xl">Choose your studio scene.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {setups.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={22} /></div>
                  <h3 className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.04em]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#06111F]/55">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {durations.map((d) => (
            <div key={d.label} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm text-center">
              <Clock className="mx-auto text-[#0B7CFF]" size={28} />
              <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{d.label}</p>
              <p className="mt-2 text-4xl font-black">{d.time}</p>
              <p className="mt-3 text-sm leading-6 text-[#06111F]/55">{d.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <Badge>Add-ons</Badge>
            <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Level up your session.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Camera Operator", "Lighting Setup", "Photographer", "Videographer", "Video Editing", "Extra Hours", "Props / Custom Setup"].map((a) => (
              <span key={a} className="rounded-full border border-[#06111F]/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#06111F]/60 shadow-sm">+ {a}</span>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[2.8rem] border border-[#06111F]/10 bg-white p-8 md:p-12">
          <Badge>Before You Arrive</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Studio Rules</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {rules.map((r) => (
              <div key={r} className="flex items-start gap-3 text-[#06111F]/65">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={16} />
                <span className="text-sm leading-6">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to shoot?</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Book the studio.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Pick your setup, choose a duration, and reserve your production slot.</p>
          <a href="/book?package=studio-rent" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
            Book Studio <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
