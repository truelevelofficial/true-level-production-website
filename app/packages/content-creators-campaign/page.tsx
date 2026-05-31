import { ArrowRight, CheckCircle2, Users, Sparkles, Film, MessageCircle, Edit3, Send, Target } from "lucide-react";
import { FaInstagram, FaTiktok, FaYoutube, FaFacebookF } from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Creators Campaign | True Level Production",
  description:
    "Build a creator-led campaign with social-first videos made for platforms, ads, and brand awareness.",
};

const flow = [
  { icon: MessageCircle, step: "01", title: "Brief", desc: "We learn your brand, goals, and campaign message." },
  { icon: Users, step: "02", title: "Creator Selection", desc: "We match the right creators for your brand and audience." },
  { icon: Edit3, step: "03", title: "Script & Direction", desc: "Talking points, hooks, and creative direction for each creator." },
  { icon: Film, step: "04", title: "Production", desc: "Filming day with direction, lighting, and on-set branding." },
  { icon: Send, step: "05", title: "Delivery", desc: "Edited videos, captions, and platform-ready exports." },
];

const deliverables = [
  { title: "Hook Videos", desc: "Attention-grabbing opens for feed and ads." },
  { title: "Main Content", desc: "Full-length creator videos for brand channels." },
  { title: "Ad Cutdowns", desc: "Shortened versions for paid social campaigns." },
  { title: "Captions", desc: "Platform-optimized captions and call-to-action text." },
  { title: "Thumbnails", desc: "Custom thumbnails for YouTube and video assets." },
];

const platforms = [
  { icon: FaTiktok, name: "TikTok" },
  { icon: FaInstagram, name: "Instagram" },
  { icon: FaYoutube, name: "YouTube" },
  { icon: FaFacebookF, name: "Facebook" },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default function ContentCreatorsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Badge>Creator Campaign</Badge>
            <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Content Creators Campaign</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#06111F]/58">Build a creator-led campaign with social-first videos made for platforms, ads, and brand awareness.</p>
            <a href="/book?package=content-creators-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] active:scale-95">
              Start Creator Campaign <ArrowRight size={16} />
            </a>
          </div>
          <div className="flex flex-wrap gap-4 rounded-[2rem] bg-white p-8 shadow-sm">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="flex items-center gap-3 rounded-2xl border border-[#06111F]/10 bg-[#F7F8FB] px-5 py-3">
                  <Icon size={22} className="text-[#0B7CFF]" />
                  <span className="text-sm font-black uppercase tracking-[0.12em]">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-24">
          <Badge>Campaign Flow</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-6xl">From brief to delivery.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {flow.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm ${i % 2 ? "md:translate-y-8" : ""}`}>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={18} /></div>
                  <p className="mt-6 text-xs font-black text-[#06111F]/25">{f.step}</p>
                  <h3 className="mt-1 text-xl font-black uppercase leading-none tracking-[-0.03em]">{f.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#06111F]/55">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <Badge>Deliverables</Badge>
            <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">What you receive.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {deliverables.map((d) => (
              <div key={d.title} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <Target className="text-[#0B7CFF]" size={18} />
                <h3 className="mt-3 text-base font-black uppercase tracking-[-0.02em]">{d.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#06111F]/55">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[2.8rem] border border-[#06111F]/10 bg-white p-8 md:p-12">
          <Badge>Usage Rights</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Content you can use.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Full usage rights for organic social posts",
              "Paid ads usage included in campaign pricing",
              "Whitelisting available for creator accounts",
              "Content license covers brand channels and ads",
              "Additional usage rights available as add-on",
              "No time limit on content usage",
            ].map((r) => (
              <div key={r} className="flex items-start gap-3 text-[#06111F]/65">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={16} />
                <span className="text-sm leading-6">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to launch?</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Start your creator campaign.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Brief your brand goals, and we will match creators and produce platform-ready content.</p>
          <a href="/book?package=content-creators-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
            Start Creator Campaign <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
