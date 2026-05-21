import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { CopyButton } from "@/components/copy-button";
import { createAdminMeetingAction, updateBookingStatusAction } from "@/lib/actions";
import { getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { adminMeetingTypes, adminMeetingStatuses, services } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ status?: string; date?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [bookings, clients] = await Promise.all([getBookings({ type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] } }), getClients()]);
  const filtered = bookings.filter((booking) => (!params.status || booking.status === params.status) && (!params.date || booking.startTime.toISOString().startsWith(params.date)));
  const today = new Date().toISOString().slice(0, 10);
  return <AdminShell title="Meetings">{!hasDatabase() ? <SetupNotice /> : null}
    <form action={createAdminMeetingAction} className="mb-6 grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Manual meeting</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Add Meeting</h2></div>
      <Field label="Existing client"><select className={inputClass} name="clientId"><option value="">Create/link by email</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName} - {client.email}</option>)}</select></Field>
      <Field label="Client name"><input className={inputClass} name="fullName" required /></Field>
      <Field label="Company"><input className={inputClass} name="companyName" /></Field>
      <Field label="Phone"><input className={inputClass} name="phone" required /></Field>
      <Field label="WhatsApp"><input className={inputClass} name="whatsapp" /></Field>
      <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
      <Field label="Meeting type"><select className={inputClass} name="meetingType">{adminMeetingTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <Field label="Status"><select className={inputClass} name="status">{adminMeetingStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
      <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
      <Field label="Time"><input className={inputClass} name="time" required type="time" /></Field>
      <Field label="Duration hours"><input className={inputClass} defaultValue="1" name="durationHours" required type="number" min="1" max="12" /></Field>
      <Field label="Service"><select className={inputClass} name="serviceType">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
      <Field label="Location"><input className={inputClass} name="meetingLocation" /></Field>
      <Field label="Google Meet link"><input className={inputClass} name="meetingLink" type="url" placeholder="Auto-generated for Google Meeting type" /></Field>
      <Field label="Assigned team member"><input className={inputClass} name="assignedTeamMember" /></Field>
      <Field label="Meeting notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
      <Field label="Internal notes"><textarea className={inputClass} name="internalNotes" rows={3} /></Field>
      <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Meeting</button></div>
    </form>
    <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-3">
      <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{adminMeetingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      <input className={inputClass} defaultValue={params.date || ""} name="date" type="date" />
      <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
    </form>
    <div className="mb-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Today meetings</p><p className="mt-2 text-3xl font-black">{bookings.filter((booking) => booking.startTime.toISOString().startsWith(today)).length}</p></div>
    <div className="grid gap-4">{filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No meetings found.</p> : null}{filtered.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.meetingType}</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.serviceType} / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p>{booking.meetingLocation ? <p className="text-[#06111F]/60">Location: {booking.meetingLocation}</p> : null}{booking.assignedTeamMember ? <p className="text-[#06111F]/60">Team: {booking.assignedTeamMember}</p> : null}{booking.meetingLink ? <div className="mt-2 flex items-center gap-2"><a className="text-[#0B7CFF] text-sm underline" href={booking.meetingLink} target="_blank">Open Google Meet</a><CopyButton text={booking.meetingLink} /></div> : null}<div className="mt-4 flex flex-wrap gap-2">{["APPROVED", "COMPLETED", "CANCELLED"].map((status) => <form action={updateBookingStatusAction} key={status}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value={status} /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">{status}</button></form>)}</div></article>)}</div>
  </AdminShell>;
}
