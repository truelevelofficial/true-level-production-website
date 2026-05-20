import { Calendar, Camera, MonitorPlay } from "lucide-react";
import { PageShell } from "@/components/form-fields";
import { requireAuth } from "@/lib/auth";

const options = [
  { href: "/book/meeting?type=GOOGLE_MEETING", icon: MonitorPlay, title: "Google Meeting", text: "Book an online discovery call and wait for admin approval." },
  { href: "/book/meeting?type=COMPANY_MEETING", icon: Calendar, title: "Company Meeting", text: "Visit the company office for a project or production discussion." },
  { href: "/book/studio", icon: Camera, title: "Studio Booking", text: "Reserve Cyclorama, creator corners, product zone, podcast setup, or lifestyle setups." },
];

export default async function BookPage() {
  await requireAuth();
  return (
    <PageShell eyebrow="Book True Level" title="Choose the booking lane." text="Select the right path and submit a request. The team will review availability, pricing, and confirmation details.">
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <a key={option.title} className="group rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10" href={option.href}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B7CFF] text-white"><Icon size={24} /></div>
              <h2 className="mt-16 text-3xl font-black uppercase leading-none tracking-[-0.05em]">{option.title}</h2>
              <p className="mt-4 leading-7 text-[#06111F]/55">{option.text}</p>
            </a>
          );
        })}
      </div>
    </PageShell>
  );
}
