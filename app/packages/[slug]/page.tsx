import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { packages, getPackageBySlug } from "@/lib/packages";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return {};
  return {
    title: pkg.metaTitle,
    description: pkg.metaDescription,
  };
}

function GradientPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#0B7CFF]/20 via-white to-[#0B7CFF]/10 md:h-64">
      <span className="text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/30">{label}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  const process = [
    ["01", "Brief", "Tell us about your project, goals, and timeline."],
    ["02", "Planning", "We create the concept, shot list, and production plan."],
    ["03", "Production", "Shoot day with crew, direction, and creative execution."],
    ["04", "Delivery", "Edit, color, sound, and prepare final assets."],
    ["05", "Review", "Feedback round and final approvals before handoff."],
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
        <a
          href="/#packages"
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#0B7CFF]"
        >
          ← Back to Packages
        </a>

        <div className="grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <Badge>Package</Badge>
            <h1 className="text-6xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">
              {pkg.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#06111F]/58">{pkg.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={pkg.bookingLink}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F] active:scale-95"
              >
                {pkg.ctaLabel} <ArrowRight size={16} />
              </a>
              <a
                href="/#packages"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#06111F]/15 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF] active:scale-95"
              >
                View All Packages
              </a>
            </div>
          </div>

          <GradientPlaceholder label={pkg.title} />
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[2.2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
            <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
              <Sparkles size={16} /> Best for
            </h2>
            <ul className="mt-5 grid gap-3">
              {pkg.bestFor.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#06111F]/65">
                  <CheckCircle2 className="shrink-0 text-[#0B7CFF]" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2.2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
            <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
              <Sparkles size={16} /> What is included
            </h2>
            <ul className="mt-5 grid gap-3">
              {pkg.included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#06111F]/65">
                  <CheckCircle2 className="shrink-0 text-[#0B7CFF]" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2.2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm md:col-span-2 lg:col-span-1">
            <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
              <Sparkles size={16} /> Deliverables
            </h2>
            <ul className="mt-5 grid gap-3">
              {pkg.deliverables.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#06111F]/65">
                  <CheckCircle2 className="shrink-0 text-[#0B7CFF]" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {process.map(([num, title, desc], i) => (
            <div
              key={title}
              className={`rounded-[2.2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm ${i % 2 ? "md:translate-y-8" : ""}`}
            >
              <p className="text-5xl font-black text-[#06111F]/[0.06]">{num}</p>
              <h3 className="mt-2 text-xl font-black uppercase leading-none tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#06111F]/55">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2.2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm md:p-10">
          <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
            <Plus size={16} /> Add-ons
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {pkg.addons.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#06111F]/60"
              >
                + {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-10 text-white md:p-16">
          <div className="relative">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Ready to start?</p>
            <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-7xl">
              {pkg.ctaLabel}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
              Tell us about your project. We will review availability, pricing, and confirm your production timeline.
            </p>
            <a
              href={pkg.bookingLink}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] shadow-xl transition hover:bg-[#06111F] hover:text-white active:scale-95"
            >
              {pkg.ctaLabel} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
