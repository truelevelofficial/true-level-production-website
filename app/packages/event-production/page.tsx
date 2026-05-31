import { ArrowRight, CheckCircle2, Camera, Video, Image, Clapperboard, Film, Users, Edit3, Zap, Radio } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Production | True Level Production",
  description:
    "Turn live moments into social-ready content, highlight edits, and campaign assets.",
};

const eventTypes = [
  { icon: Radio, title: "Launch Events", desc: "Product launches, store openings, and brand reveal events." },
  { icon: Users, title: "Corporate Events", desc: "Conferences, internal events, and company gatherings." },
  { icon: Zap, title: "Gaming Events", desc: "Tournaments, live streams, and gaming community events." },
  { icon: Clapperboard, title: "Brand Activations", desc: "Pop-ups, experiential activations, and brand experiences." },
  { icon: Film, title: "Conferences", desc: "Talks, panels, and keynote coverage with multi-camera setup." },
  { icon: Users, title: "Community Events", desc: "Local events, meetups, and community-driven gatherings." },
];

const crew = [
  { icon: Camera, title: "Camera Operator", desc: "Professional camera operation for live event coverage." },
  { icon: Image, title: "Photographer", desc: "Event photography for highlights and campaign use." },
  { icon: Edit3, title: "Editor", desc: "On-site or post-event editing for fast turnaround." },
  { icon: Video, title: "Director", desc: "Production direction and live coordination." },
];

const process = [
  { step: "Capture", desc: "Multi-camera coverage of key moments and highlights." },
  { step: "Edit", desc: "On-site or post-event editing for fast delivery." },
  { step: "Deliver", desc: "Platform-ready exports for social, web, and broadcast." },
  { step: "Publish", desc: "Optimized cuts for reels, stories, and campaign use." },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default function EventProductionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#06111F] text-white selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-[#0B7CFF]/20 via-[#06111F] to-[#06111F] p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[40px] border-white/5" />
          <div className="relative">
            <Badge>Event Coverage</Badge>
            <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Event Production</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Turn live moments into social-ready content, highlight edits, and campaign assets.</p>
            <a href="/book?package=event-production" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-white hover:text-[#06111F] active:scale-95">
              Book Event Production <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-20">
          <Badge>Coverage Types</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] text-white md:text-6xl">We cover every event.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {eventTypes.map((e) => {
              const Icon = e.icon;
              return (
                <div key={e.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.08]">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B7CFF]/20 text-[#0B7CFF]"><Icon size={22} /></div>
                  <h3 className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.04em] text-white">{e.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/50">{e.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Production Crew</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] text-white md:text-5xl">The team behind the frame.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {crew.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#0B7CFF]/20 text-[#0B7CFF]"><Icon size={24} /></div>
                  <h3 className="mt-4 text-lg font-black uppercase tracking-[-0.02em] text-white">{c.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Live to Final</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] text-white md:text-5xl">From capture to publish.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {process.map((p, i) => (
              <div key={p.step} className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <p className="text-5xl font-black text-white/[0.06]">0{i + 1}</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white">{p.step}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[2.8rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur md:p-12">
          <Badge>Deliverables</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] text-white md:text-5xl">What you get.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Highlight video (60–90 seconds)",
              "Event reels for social platforms",
              "Edited photo gallery",
              "Full-length aftermovie",
              "Social media cuts (vertical + horizontal)",
              "Raw footage archive (optional add-on)",
            ].map((d) => (
              <div key={d} className="flex items-start gap-3 text-white/60">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={16} />
                <span className="text-sm leading-6">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Have an event?</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Book event production.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Tell us about your event. We will plan coverage, assign crew, and deliver content ready for publishing.</p>
          <a href="/book?package=event-production" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
            Book Event Production <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
