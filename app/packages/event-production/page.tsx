import { ArrowRight, CheckCircle2, Camera, Video, Image, Clapperboard, Film, Users, Edit3, Zap, Radio, Monitor, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Production | True Level Production",
  description:
    "Turn live moments into social-ready content, highlight edits, and campaign assets.",
};

const eventTypes = [
  { icon: Radio, title: "Launch Events", desc: "Product launches, store openings, and brand reveals." },
  { icon: Users, title: "Corporate Events", desc: "Conferences, internal events, and company gatherings." },
  { icon: Zap, title: "Gaming Events", desc: "Tournaments, live streams, and gaming community events." },
  { icon: Clapperboard, title: "Brand Activations", desc: "Pop-ups, experiential activations, and brand experiences." },
  { icon: Monitor, title: "Conferences", desc: "Talks, panels, and keynote coverage with multi-camera setup." },
];

const crew = [
  { name: "Director", role: "Production lead and live coordination" },
  { name: "Camera Operator", role: "Professional multi-camera event coverage" },
  { name: "Photographer", role: "Event photography for highlights and assets" },
  { name: "Editor", role: "On-site and post-event editing" },
  { name: "Social Producer", role: "Real-time social cuts and platform content" },
];

const pipeline = [
  { step: "01", title: "Capture", desc: "Multi-camera coverage of every key moment." },
  { step: "02", title: "Edit", desc: "On-site or post-event editing for fast turnaround." },
  { step: "03", title: "Deliver", desc: "Platform-ready exports for social, web, and broadcast." },
  { step: "04", title: "Publish", desc: "Optimized cuts for reels, stories, and campaign use." },
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
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-[#0B7CFF] to-[#063D7A] p-8 text-white md:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[38px] border-white/10" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <Badge>Event Coverage</Badge>
              <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Event Production</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">Turn live moments into social-ready content, highlight edits, and campaign assets.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/book?package=event-production" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
                  Book Event Production <ArrowRight size={16} />
                </a>
                <a href="/#packages" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-white/20 active:scale-95">
                  View Packages
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-white/20 to-white/5" />
              <div className="absolute -left-4 -top-4 rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">Live Coverage</div>
              <div className="absolute -bottom-3 -right-3 rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">Highlight Edits</div>
              <div className="absolute -right-4 top-1/3 rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">Social Cuts</div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Badge>Coverage Types</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-6xl">We cover every event.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {eventTypes.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={e.title} className={`group rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${i === 1 || i === 3 ? "md:translate-y-6" : ""}`}>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF] transition group-hover:bg-[#0B7CFF] group-hover:text-white"><Icon size={18} /></div>
                  <h3 className="mt-4 text-lg font-black uppercase leading-none tracking-[-0.03em]">{e.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#06111F]/55">{e.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Production Pipeline</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">From capture to publish.</h2>
          <div className="mt-10">
            <div className="relative grid gap-0 md:grid-cols-4">
              {pipeline.map((p, i) => (
                <div key={p.step} className="relative">
                  <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black text-[#0B7CFF]">{p.step}</span>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-[-0.03em]">{p.title}</h3>
                        <p className="mt-1 text-sm text-[#06111F]/55">{p.desc}</p>
                      </div>
                    </div>
                  </div>
                  {i < pipeline.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 z-10 -translate-y-1/2">
                      <ChevronRight className="text-[#0B7CFF]" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-[#0B7CFF] via-[#4A9EFF] to-[#0B7CFF] opacity-30" />
          </div>
        </div>

        <div className="mt-20">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div className="rounded-[2.8rem] bg-[#0B7CFF] p-8 text-white md:p-10">
              <Badge>Crew</Badge>
              <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-4xl">The team behind the frame.</h2>
              <div className="mt-8 grid gap-4">
                {crew.map((c) => (
                  <div key={c.name} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white"><Camera size={16} /></div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[-0.01em]">{c.name}</p>
                      <p className="text-xs text-white/60">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Badge>Deliverables</Badge>
              <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">What you get.</h2>
              <div className="mt-6 grid gap-3">
                {[
                  { label: "Event Reels", desc: "Short-form highlights for social platforms" },
                  { label: "Highlight Video", desc: "60–90 second edited recap of key moments" },
                  { label: "Edited Photos", desc: "Curated photo gallery from the event" },
                  { label: "Aftermovie", desc: "Full-length cinematic event film" },
                  { label: "Social Cuts", desc: "Vertical + horizontal versions for every platform" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-4 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-sm">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF]">
                      <Video size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[-0.01em]">{d.label}</p>
                      <p className="text-xs text-[#06111F]/55">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to capture the moment?</p>
              <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Book event production.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Tell us about your event. We will plan coverage, assign crew, and deliver content ready for publishing.</p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="/book?package=event-production" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
                Book Event Production <ArrowRight size={16} />
              </a>
              <a href="/#packages" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-white/20 active:scale-95">
                View All Packages
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
