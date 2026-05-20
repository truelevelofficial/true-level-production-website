import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { getBookings, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { displayDate } from "@/lib/dates";

export default async function StudioPage() {
  await requireAdmin();
  const bookings = await getBookings({ type: "STUDIO" });
  return <AdminShell title="Studio Management">{!hasDatabase() ? <SetupNotice /> : null}<div className="grid gap-4 md:grid-cols-2">{bookings.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.studioSetup}</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.durationHours} hours / {booking.peopleCount} people / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p><p className="mt-3 text-sm text-[#06111F]/55">{booking.bookingPurpose}</p></article>)}</div></AdminShell>;
}
