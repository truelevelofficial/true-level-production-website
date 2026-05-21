import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { AdminMeetingForm } from "@/components/admin-meeting-form";
import { inputClass } from "@/components/form-fields";
import { CopyButton } from "@/components/copy-button";
import { updateBookingStatusAction } from "@/lib/actions";
import { getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { adminMeetingTypes, adminMeetingStatuses, services } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ status?: string; date?: string; error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [bookings, clients] = await Promise.all([getBookings({ type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] } }), getClients()]);
  const filtered = bookings.filter((booking) => (!params.status || booking.status === params.status) && (!params.date || booking.startTime.toISOString().startsWith(params.date)));
  const today = new Date().toISOString().slice(0, 10);
  return <AdminShell title="Meetings">{!hasDatabase() ? <SetupNotice /> : null}
    {params.error === "invalid-meeting" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Could not save meeting. Select an existing client or enter a valid name, phone, and email.</div> : null}
    <AdminMeetingForm clients={clients.map((client) => ({ id: client.id, fullName: client.fullName, companyName: client.companyName, phone: client.phone, whatsapp: client.whatsapp, email: client.email }))} meetingTypes={adminMeetingTypes} meetingStatuses={adminMeetingStatuses} services={services} />
    <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-3">
      <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{adminMeetingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      <input className={inputClass} defaultValue={params.date || ""} name="date" type="date" />
      <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
    </form>
    <div className="mb-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Today meetings</p><p className="mt-2 text-3xl font-black">{bookings.filter((booking) => booking.startTime.toISOString().startsWith(today)).length}</p></div>
    <div className="grid gap-4">{filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No meetings found.</p> : null}{filtered.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.meetingType}</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.serviceType} / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p>{booking.meetingLocation ? <p className="text-[#06111F]/60">Location: {booking.meetingLocation}</p> : null}{booking.assignedTeamMember ? <p className="text-[#06111F]/60">Team: {booking.assignedTeamMember}</p> : null}{booking.meetingLink ? <div className="mt-2 flex items-center gap-2"><a className="text-[#0B7CFF] text-sm underline" href={booking.meetingLink} target="_blank">Open Google Meet</a><CopyButton text={booking.meetingLink} /></div> : null}<div className="mt-4 flex flex-wrap gap-2">{["APPROVED", "COMPLETED", "CANCELLED"].map((status) => <form action={updateBookingStatusAction} key={status}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value={status} /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">{status}</button></form>)}</div></article>)}</div>
  </AdminShell>;
}
