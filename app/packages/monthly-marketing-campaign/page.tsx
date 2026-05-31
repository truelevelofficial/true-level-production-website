import { ArrowRight, CheckCircle2, Sparkles, Calendar, BarChart3, RefreshCw, TrendingUp, Target, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Marketing Campaign | True Level Production",
  description:
    "A monthly content and marketing system for brands that need consistent output, clear planning, and regular creative production.",
};

const workflow = [
  { icon: Target, step: "01", title: "Strategy", desc: "Monthly content strategy aligned with your brand goals." },
  { icon: Calendar, step: "02", title: "Content Plan", desc: "Detailed calendar with topics, formats, and deadlines." },
  { icon: Sparkles, step: "03", title: "Shoot", desc: "Production day with creative direction and on-brand execution." },
  { icon: Layers, step: "04", title: "Edit", desc: "Post-production, color, sound, and platform formatting." },
  { icon: TrendingUp, step: "05", title: "Publish", desc: "Scheduled delivery for organic and paid channels." },
  { icon: RefreshCw, step: "06", title: "Review", desc: "Monthly review of performance, insights, and next month plan." },
];

const rhythm = [
  { icon: Calendar, title: "Weekly Content", desc: "Consistent output every week, not a one-time drop." },
  { icon: BarChart3, title: "Monthly Reporting", desc: "Performance recap with insights and recommendations." },
  { icon: RefreshCw, title: "Campaign Refresh", desc: "New angles, hooks, and formats each month." },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default function MonthlyMarketingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Badge>Monthly Retainer</Badge>
            <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Monthly Marketing Campaign</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#06111F]/58">A monthly content and marketing system for brands that need consistent output, clear planning, and regular creative production.</p>
            <a href="/book?package=monthly-marketing-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] active:scale-95">
              Start Monthly Campaign <ArrowRight size={16} />
            </a>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">Monthly System</p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {["Week 1", "Week 2", "Week 3", "Week 4"].map((w, i) => (
                <div key={w} className="rounded-xl bg-[#0B7CFF]/10 p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0B7CFF]">{w}</p>
                  <p className="mt-1 text-xs font-black text-[#06111F]/70">
                    {["Strategy", "Shoot", "Edit", "Deliver"][i]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {["Plan", "Create", "Refine", "Publish"].map((p, i) => (
                <div key={p} className="rounded-xl bg-[#06111F]/5 p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#06111F]/40">{p}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#06111F]/40">Predictable monthly rhythm with fresh content every week.</p>
          </div>
        </div>

        <div className="mt-24">
          <Badge>Monthly Workflow</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-6xl">What happens every month.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-6">
            {workflow.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className={`rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm ${i % 2 ? "md:translate-y-6" : ""}`}>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={16} /></div>
                  <p className="mt-4 text-[10px] font-black text-[#06111F]/20">{w.step}</p>
                  <h3 className="mt-1 text-base font-black uppercase tracking-[-0.02em]">{w.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#06111F]/55">{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Badge>Deliverables</Badge>
            <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Monthly output.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Content Calendar", desc: "Monthly plan with topics, formats, and publish dates." },
              { title: "Short-Form Videos", desc: "Reels and TikToks according to your package tier." },
              { title: "Campaign Concepts", desc: "Fresh creative ideas aligned with brand calendar." },
              { title: "Performance Notes", desc: "Monthly insights and optimization recommendations." },
            ].map((d) => (
              <div key={d.title} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <Calendar className="text-[#0B7CFF]" size={18} />
                <h3 className="mt-3 text-base font-black uppercase tracking-[-0.02em]">{d.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#06111F]/55">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Performance Rhythm</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Always on. Always fresh.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {rhythm.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={22} /></div>
                  <h3 className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.04em]">{r.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#06111F]/55">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 rounded-[2.8rem] border border-[#06111F]/10 bg-white p-8 md:p-12">
          <Badge>Good For</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Built for consistent brands.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Brands that need consistent weekly content output",
              "New product launches with ongoing creative support",
              "Social presence growth with regular publishing",
              "Local businesses scaling their content marketing",
              "Companies replacing scattered production with a system",
              "Teams that want predictable costs and clear deliverables",
            ].map((g) => (
              <div key={g} className="flex items-start gap-3 text-[#06111F]/65">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={16} />
                <span className="text-sm leading-6">{g}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to go monthly?</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Start your monthly campaign.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Get consistent content, clear planning, and a dedicated production rhythm every month.</p>
          <a href="/book?package=monthly-marketing-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
            Start Monthly Campaign <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
