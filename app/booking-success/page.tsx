import { PageShell } from "@/components/form-fields";
import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <PageShell eyebrow="Request received" title="Your booking is pending review." text="The True Level team will review the request, confirm availability, and follow up with approval details.">
      <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-7 shadow-sm">
        <p className="text-lg leading-8 text-[#06111F]/65">Status: Pending. If email notifications are configured, you will receive updates after admin approval or rejection.</p>
        <Link className="mt-8 inline-flex rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white" href="/">Back to homepage</Link>
      </div>
    </PageShell>
  );
}
