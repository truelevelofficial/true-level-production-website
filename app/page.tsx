import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clapperboard,
  Film,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Play,
  Radio,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href: string;
};

type Service = {
  icon: LucideIcon;
  title: string;
  number: string;
  text: string;
};

const services: Service[] = [
  {
    icon: Film,
    title: "Brand Films",
    number: "01",
    text: "Launch films, campaign videos, product stories, interviews, reels, and social-first edits.",
  },
  {
    icon: Lightbulb,
    title: "Creative Direction",
    number: "02",
    text: "Concepts, scripts, shot lists, moodboards, campaign angles, and full production direction.",
  },
  {
    icon: Users,
    title: "UGC Content",
    number: "03",
    text: "Creator-led videos that feel native, build trust, and give brands ad-ready content.",
  },
  {
    icon: Camera,
    title: "Studio Shoots",
    number: "04",
    text: "Cyclorama, ready-made setups, product shooting, creator sessions, and lighting support.",
  },
  {
    icon: Radio,
    title: "Event Coverage",
    number: "05",
    text: "Live coverage, interviews, instant reels, recap videos, and on-ground production teams.",
  },
  {
    icon: Megaphone,
    title: "Campaign Assets",
    number: "06",
    text: "Social designs, ad creatives, campaign visuals, thumbnails, banners, and digital assets.",
  },
];

const process = [
  ["01", "Find The Hook", "We find the idea people will stop for, remember, and react to."],
  ["02", "Build The Frame", "We shape the visual direction, references, script, setup, and production plan."],
  ["03", "Shoot The Scene", "We direct, light, film, and turn the space into a content machine."],
  ["04", "Cut For Impact", "We edit, color, sound, package, and prepare content for publishing and ads."],
] as const;

const studio = [
  ["01", "Cyclorama"],
  ["02", "Creator Corners"],
  ["03", "Product Zone"],
  ["04", "Podcast Look"],
  ["05", "Lifestyle Setups"],
  ["06", "Lighting Ready"],
] as const;

const work = [
  ["Brand Films", "Campaign films, launch videos, and product storytelling."],
  ["UGC Ads", "Creator content, testimonials, hooks, and native ads."],
  ["Events", "Live coverage, interviews, instant reels, and recap edits."],
  ["Studio Sessions", "Cyclorama shoots, creators, podcasts, and content days."],
  ["Digital Visuals", "Campaign posts, ad creatives, thumbnails, and key visuals."],
  ["Content Strategy", "Concepts, scripts, moodboards, and full content planning."],
] as const;

const packages = [
  {
    name: "Studio Day",
    best: "For brands and creators",
    points: ["Cyclorama or setup location", "Lighting-ready space", "Shoot support available"],
  },
  {
    name: "Content Sprint",
    best: "For high-output reels",
    points: ["Creative concepts", "One shoot day", "Multiple edited videos"],
  },
  {
    name: "Campaign Build",
    best: "For products and launches",
    points: ["Campaign idea", "Production plan", "UGC and ad-ready assets"],
  },
] as const;

function Button({ children, variant = "primary", href }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.12em] transition active:scale-95";
  const styles =
    variant === "primary"
      ? "bg-[#0B7CFF] text-white shadow-xl shadow-blue-500/20 hover:bg-[#06111F]"
      : "border border-[#06111F]/15 bg-white text-[#06111F] hover:border-[#0B7CFF] hover:text-[#0B7CFF]";

  return (
    <a className={`${base} ${styles}`} href={href}>
      {children}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-[185px] overflow-hidden rounded-full bg-white px-4 shadow-sm ring-1 ring-[#06111F]/10">
        <div className="flex h-full items-center justify-center">
          <span className="text-[22px] font-black uppercase tracking-[-0.05em] text-[#0B7CFF]">TRUE LEVEL</span>
          <span className="ml-2 h-3 w-3 rounded-full bg-[#0B7CFF]" />
        </div>
      </div>
      <div className="hidden sm:block">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#06111F]">Production</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#06111F]/45">Creative Studio</p>
      </div>
    </div>
  );
}

function VisualCard({ title, label, className = "" }: { title: string; label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-white p-4 shadow-2xl shadow-blue-950/10 ring-1 ring-[#06111F]/10 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(11,124,255,0.18),transparent_34%),linear-gradient(135deg,rgba(11,124,255,0.08),transparent)]" />
      <div className="relative flex h-full min-h-[260px] flex-col justify-between rounded-[1.4rem] border border-[#06111F]/10 bg-[#F7F8FB] p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#0B7CFF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">{label}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#0B7CFF]" />
        </div>
        <h3 className="max-w-[220px] text-4xl font-black uppercase leading-[0.85] tracking-[-0.06em] text-[#06111F]">{title}</h3>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] text-[#06111F] selection:bg-[#0B7CFF] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.28] [background-image:radial-gradient(circle_at_1px_1px,rgba(6,17,31,0.16)_1px,transparent_0)] [background-size:22px_22px]" />

      <header className="fixed left-0 right-0 top-0 z-40 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#06111F]/10 bg-white/85 px-5 py-3 shadow-sm backdrop-blur-xl">
          <LogoMark />
          <nav className="hidden items-center gap-7 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/55 md:flex">
            <a className="hover:text-[#0B7CFF]" href="#services">Services</a>
            <a className="hover:text-[#0B7CFF]" href="#studio">Studio</a>
            <a className="hover:text-[#0B7CFF]" href="#work">Work</a>
            <a className="hover:text-[#0B7CFF]" href="#packages">Packages</a>
          </nav>
          <Button href="/book">Book</Button>
        </div>
      </header>

      <section className="relative min-h-screen pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(11,124,255,0.18),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(11,124,255,0.10),transparent_24%)]" />
        <div className="absolute right-[-110px] top-[155px] hidden h-[420px] w-[420px] rotate-12 rounded-[4rem] border border-[#06111F]/10 bg-white/40 lg:block" />
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.7em] text-[#06111F]/25 md:block">
          Concept Shoot Cut Publish Scale
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <SectionLabel>Creative Production Company</SectionLabel>
            <h1 className="max-w-5xl text-[4rem] font-black uppercase leading-[0.75] tracking-[-0.09em] text-[#06111F] md:text-[7.2rem] lg:text-[8.2rem]">
              We Create The Scene.
              <span className="relative block text-[#0B7CFF]">
                You Own The Screen.
                <span className="absolute -right-2 top-1 hidden rotate-6 rounded-full bg-[#06111F] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-white md:inline-flex">
                  Production
                </span>
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#06111F]/65">
              True Level is a creative production company and studio for brands. We create campaign ideas, shoot social-first videos, build UGC content, cover events, and run studio sessions inside our Cyclorama and ready-made setups.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/book/meeting">Start a Project <ArrowRight size={16} /></Button>
              <Button href="/book/studio" variant="secondary">Enter The Studio <Play size={16} /></Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[["01", "Concept Lab"], ["02", "Production Floor"], ["03", "Content Engine"]].map(([num, label]) => (
                <div key={label} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
                  <p className="text-3xl font-black text-[#0B7CFF]">{num}</p>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#06111F]/45">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[650px] max-lg:hidden">
            <div className="absolute left-2 top-8 z-10 -rotate-6 rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-blue-500/20">Cyclorama</div>
            <div className="absolute right-0 top-28 z-10 rotate-6 rounded-full border border-[#06111F]/10 bg-white/90 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#06111F] backdrop-blur">Set Locations</div>
            <div className="absolute bottom-16 left-10 z-10 rotate-3 rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">UGC Ready</div>
            <VisualCard title="Shoot" label="Frame 01" className="absolute left-0 top-20 w-[44%] -rotate-6" />
            <VisualCard title="Studio" label="Frame 02" className="absolute right-0 top-0 w-[52%] rotate-3" />
            <VisualCard title="Cut" label="Frame 03" className="absolute bottom-8 left-[18%] w-[58%] rotate-2" />
            <div className="absolute left-[42%] top-[44%] z-20 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#06111F]/10 bg-white/80 shadow-2xl shadow-blue-950/10 backdrop-blur-xl">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[#0B7CFF] text-white">
                <Camera size={34} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#06111F]/10 bg-[#0B7CFF] py-5 text-white">
        <div className="flex gap-12 overflow-hidden whitespace-nowrap text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">
          <span>Film</span><span>UGC</span><span>Studio</span><span>Reels</span><span>Campaigns</span><span>Events</span><span>Design</span><span>Cyclorama</span>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24">
        <div className="mb-12 grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-end">
          <div>
            <SectionLabel>The Production Menu</SectionLabel>
            <h2 className="text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Choose your content weapon.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#06111F]/58">
            Every service is built like a production lane. It starts with an idea, moves into the frame, then becomes content that can live on feed, ads, events, and brand pages.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="group relative min-h-[330px] overflow-hidden rounded-[2.2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-950/10">
                <div className="absolute -bottom-16 -right-10 text-[10rem] font-black leading-none text-[#06111F]/[0.035] transition group-hover:text-[#0B7CFF]/10">{service.number}</div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#0B7CFF]/0 blur-3xl transition group-hover:bg-[#0B7CFF]/15" />
                <div className="relative flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B7CFF] text-white"><Icon size={24} /></div>
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-[#06111F]/35">{service.number}</span>
                </div>
                <div className="relative mt-20">
                  <h3 className="text-3xl font-black uppercase leading-none tracking-[-0.05em]">{service.title}</h3>
                  <p className="mt-5 leading-7 text-[#06111F]/55">{service.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="studio" className="relative scroll-mt-28 border-y border-[#06111F]/10 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(11,124,255,0.12),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(6,17,31,0.04),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Studio World</SectionLabel>
            <h2 className="text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">One studio. Many scenes.</h2>
            <p className="mt-6 text-lg leading-8 text-[#06111F]/62">
              A Cyclorama for clean premium frames, ready-made setups for fast social shoots, and production support for brands that need content without wasting time building every scene from zero.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/book/studio">Book The Studio</Button>
              <Button href="#work" variant="secondary">See The Setups</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-6">
            {studio.map(([num, item], index) => (
              <div key={item} className={`${index === 0 || index === 3 ? "sm:col-span-4" : index === 1 || index === 2 ? "sm:col-span-2" : "sm:col-span-3"} min-h-[155px] rounded-[2rem] border border-[#06111F]/10 bg-[#F7F8FB] p-6 transition hover:-rotate-1 hover:bg-[#0B7CFF] hover:text-white`}>
                <p className="text-4xl font-black">{num}</p>
                <p className="mt-8 text-2xl font-black uppercase leading-none tracking-[-0.05em]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">The idea gets a pulse.</h2>
          </div>
          <p className="max-w-lg text-[#06111F]/58">A creative production flow designed to move from thought to frame to final cut without losing energy.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {process.map(([num, title, text], index) => (
            <div key={title} className={`relative min-h-[330px] overflow-hidden rounded-[2.2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm ${index % 2 ? "md:translate-y-10" : ""}`}>
              <p className="absolute -right-5 -top-7 text-9xl font-black text-[#06111F]/[0.04]">{num}</p>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0B7CFF] text-white"><Sparkles size={20} /></div>
              <h3 className="mt-24 text-3xl font-black uppercase leading-none tracking-[-0.05em]">{title}</h3>
              <p className="mt-5 text-sm leading-7 text-[#06111F]/55">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="work" className="scroll-mt-28 px-5 py-24">
        <div className="mx-auto mb-12 max-w-7xl">
          <SectionLabel>Selected Frames</SectionLabel>
          <h2 className="max-w-5xl text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Not a portfolio. A wall of proof.</h2>
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-6">
          {work.map(([title, desc], index) => (
            <div key={title} className={`group relative min-h-[330px] overflow-hidden rounded-[2.2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm ${index === 0 ? "md:col-span-4" : index === 1 ? "md:col-span-2" : index === 2 ? "md:col-span-2" : index === 3 ? "md:col-span-4" : "md:col-span-3"}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(11,124,255,0.16),transparent_28%),linear-gradient(145deg,rgba(11,124,255,0.06),transparent)]" />
              <div className="relative flex h-full min-h-[280px] flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-fit rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black text-white">0{index + 1}</span>
                  <span className="rounded-full border border-[#06111F]/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#06111F]/45">Add real media</span>
                </div>
                <div>
                  <h3 className="max-w-xl text-4xl font-black uppercase leading-none tracking-[-0.06em]">{title}</h3>
                  <p className="mt-3 max-w-md text-[#06111F]/55">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="packages" className="scroll-mt-28 border-y border-[#06111F]/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Production Lanes</SectionLabel>
            <h2 className="text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Pick the format. We build the output.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pack) => (
              <div key={pack.name} className="rounded-[2.2rem] border border-[#06111F]/10 bg-[#F7F8FB] p-7 transition hover:-translate-y-2 hover:border-[#0B7CFF]/40 hover:bg-white hover:shadow-2xl hover:shadow-blue-950/10">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{pack.best}</p>
                <h3 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-0.06em]">{pack.name}</h3>
                <div className="mt-8 grid gap-4">
                  {pack.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 text-[#06111F]/65">
                      <CheckCircle2 className="text-[#0B7CFF]" size={18} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <a className="mt-8 inline-flex w-full justify-center rounded-full border border-[#06111F]/10 bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.18em] hover:bg-[#0B7CFF] hover:text-white" href="/book/meeting">Request Package</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24">
        <div className="relative overflow-hidden rounded-[2.8rem] bg-[#0B7CFF] p-8 text-white md:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[38px] border-white/10" />
          <div className="relative grid gap-10 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Open the brief</p>
              <h2 className="mt-5 text-5xl font-black uppercase leading-[0.78] tracking-[-0.075em] md:text-8xl">Bring us the brief. We will create the production.</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">True Level turns a business objective into a creative concept, shoot plan, production day, and final content delivery.</p>
            </div>
            <div className="grid gap-3">
              <a className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-black" href="tel:01143331405"><Phone size={18} /> 01143331405</a>
              <a className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-black" href="mailto:contact@truelevel.co"><Mail size={18} /> contact@truelevel.co</a>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-black"><MapPin size={18} /> Cairo, Egypt</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#06111F]/10 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[#06111F]/38 md:flex-row">
          <p>© True Level. All rights reserved.</p>
          <p className="flex items-center gap-2"><Clapperboard size={14} /> Creative Production, Studio, UGC, Campaigns, Events.</p>
        </div>
      </footer>
    </main>
  );
}
