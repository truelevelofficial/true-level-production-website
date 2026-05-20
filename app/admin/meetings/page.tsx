import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { getBookings, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { displayDate } from "@/lib/dates";

export default async function MeetingsPage() {
  await requireAdmin();
  const bookings = await getBookings({ type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] } });
  return <AdminShell title="Meetings">{!hasDatabase() ? <SetupNotice /> : null}<div className="grid gap-4">{bookings.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.meetingType}</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.serviceType} / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)}</p>{booking.meetingLink ? <a className="text-[#0B7CFF]" href={booking.meetingLink}>{booking.meetingLink}</a> : null}</article>)}</div></AdminShell>;
}
