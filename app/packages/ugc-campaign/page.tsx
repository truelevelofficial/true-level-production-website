import { ArrowRight, CheckCircle2, Sparkles, Target, Zap, ShoppingBag, Smartphone, Star, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UGC Campaign | True Level Production",
  description:
    "Create authentic short-form videos that make your brand feel real, relatable, and ready for social ads.",
};

const angles = [
  { icon: Zap, title: "Problem / Solution", desc: "Show the pain point and how your product solves it." },
  { icon: Star, title: "Product Demo", desc: "Quick feature walkthroughs and product highlights." },
  { icon: Star, title: "Testimonial", desc: "Real customer reactions and authentic social proof." },
  { icon: ShoppingBag, title: "Unboxing", desc: "First impressions and packaging reveal content." },
  { icon: TrendingUp, title: "Before / After", desc: "Transformation content that proves results visually." },
];

const variants = [
  { label: "Hook", desc: "First 3 seconds that stop the scroll." },
  { label: "Main Video", desc: "Full-length organic-style UGC video." },
  { label: "Cutdowns", desc: "Shorter versions for ads and retargeting." },
  { label: "Captions", desc: "Platform-optimized text overlays and hooks." },
  { label: "Ad Versions", desc: "Paid social variations with different hooks." },
];

const bestFor = [
  { icon: ShoppingBag, title: "E-Commerce", desc: "Product pages, ads, and social proof content." },
  { icon: Smartphone, title: "Beauty", desc: "Tutorials, reviews, and before/after content." },
  { icon: Sparkles, title: "Food", desc: "Recipe content, taste tests, and brand integrations." },
  { icon: Target, title: "Apps", desc: "User demos, feature highlights, and install ads." },
  { icon: Star, title: "Local Brands", desc: "Community-focused content and local testimonials." },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default function UgcCampaignPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a href="/#packages" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]">← Back to Packages</a>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <Badge>UGC Content</Badge>
            <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">UGC Campaign</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#06111F]/58">Create authentic short-form videos that make your brand feel real, relatable, and ready for social ads.</p>
            <a href="/book?package=ugc-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] active:scale-95">
              Build UGC Campaign <ArrowRight size={16} />
            </a>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-[#0B7CFF]/25 via-white to-[#0B7CFF]/10 p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">UGC Performance</p>
            <p className="mt-6 text-5xl font-black leading-[0.85] tracking-[-0.05em]">4.6x</p>
            <p className="mt-2 text-sm text-[#06111F]/55">higher conversion rates with authentic creator content vs brand-produced ads.</p>
            <div className="mt-6 h-2 rounded-full bg-[#0B7CFF]/10">
              <div className="h-2 w-[80%] rounded-full bg-[#0B7CFF]" />
            </div>
            <p className="mt-2 text-xs text-[#06111F]/40">80% of consumers find UGC more relatable</p>
          </div>
        </div>

        <div className="mt-24">
          <Badge>UGC Angles</Badge>
          <h2 className="text-4xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-6xl">Content that converts.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {angles.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={18} /></div>
                  <h3 className="mt-4 text-lg font-black uppercase leading-none tracking-[-0.03em]">{a.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#06111F]/55">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Content Variants</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">One shoot. Many versions.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {variants.map((v) => (
              <div key={v.label} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 text-center shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{v.label}</p>
                <p className="mt-2 text-xs leading-5 text-[#06111F]/55">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <Badge>Best For</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Perfect for these brands.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {bestFor.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B7CFF]/10 text-[#0B7CFF]"><Icon size={18} /></div>
                  <h3 className="mt-4 text-lg font-black uppercase leading-none tracking-[-0.03em]">{b.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#06111F]/55">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 rounded-[2.8rem] border border-[#06111F]/10 bg-white p-8 md:p-12">
          <Badge>Why UGC Works</Badge>
          <h2 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em] md:text-5xl">Real content. Real results.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "UGC feels more authentic than polished brand ads",
              "Social platforms prioritize native creator content",
              "Lower production cost with higher ad performance",
              "Multiple hooks and angles from a single shoot",
              "Works across TikTok, Instagram, YouTube, and Meta Ads",
              "Scales easily with product variations and new launches",
            ].map((r) => (
              <div key={r} className="flex items-start gap-3 text-[#06111F]/65">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={16} />
                <span className="text-sm leading-6">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to create?</p>
          <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">Build your UGC campaign.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">Brief your product, choose your angles, and get authentic UGC videos ready for social and ads.</p>
          <a href="/book?package=ugc-campaign" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95">
            Build UGC Campaign <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
