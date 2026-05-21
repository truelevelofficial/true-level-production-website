import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { AdminMeetingForm } from "@/components/admin-meeting-form";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { CopyButton } from "@/components/copy-button";
import { inputClass } from "@/components/form-fields";
import { deleteMeetingAction, generateGoogleMeetLinkAction, updateBookingStatusAction } from "@/lib/actions";
import { getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { adminMeetingStatuses, adminMeetingTypes, services } from "@/lib/constants";
import { displayDate } from "@/lib/dates";
import { hasGoogleConfig } from "@/lib/google-calendar";

function MeetingTimingBadge({ startTime, endTime }: { startTime: Date; endTime: Date }) {
  const now = new Date();
  if (now >= startTime && now <= endTime) return <span className="mt-2 inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-green-700">Live now</span>;
  const minutesUntilStart = Math.ceil((startTime.getTime() - now.getTime()) / 60000);
  if (minutesUntilStart > 0 && minutesUntilStart <= 15) return <span className="mt-2 inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-700">Starts in {minutesUntilStart} min</span>;
  if (now > endTime) return <span className="mt-2 inline-flex w-fit rounded-full bg-[#06111F]/5 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">Ended</span>;
  return null;
}

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ status?: string; date?: string; deleted?: string; error?: string; generated?: string; saved?: string; updated?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [bookings, clients] = await Promise.all([getBookings({ type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] } }), getClients()]);
  const filtered = bookings.filter((booking) => (!params.status || booking.status === params.status) && (!params.date || booking.startTime.toISOString().startsWith(params.date)));
  const today = new Date().toISOString().slice(0, 10);
  const googleConfigured = hasGoogleConfig();

  return (
    <AdminShell title="Meetings">
      {!hasDatabase() ? <SetupNotice /> : null}
      {params.saved === "meeting" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Meeting saved successfully.</div> : null}
      {params.generated === "meet" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Google Meet link generated successfully. You can copy it below.</div> : null}
      {params.deleted === "meeting" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Meeting deleted successfully.</div> : null}
      {params.updated === "cancelled" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Meeting cancelled successfully.</div> : null}
      {params.updated === "approved" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Meeting approved successfully.</div> : null}
      {params.updated === "completed" ? <div className="mb-4 rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Meeting completed successfully.</div> : null}
      {params.error === "invalid-meeting" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Could not save meeting. Select an existing client or enter a valid name, phone, and email.</div> : null}
      {params.error === "google-meet" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Could not generate Google Meet link. Check Google Calendar env settings and calendar sharing.</div> : null}
      {params.error === "google-config" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Google Meet is not configured on Vercel. Add GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and CALENDAR_ID.</div> : null}
      {params.error === "cancelled-meet" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Cannot generate a Google Meet link for a cancelled meeting. Approve the meeting first or create a new meeting.</div> : null}
      {params.error === "delete-meeting" ? <div className="mb-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Could not delete meeting.</div> : null}

      <AdminMeetingForm clients={clients.map((client) => ({ id: client.id, fullName: client.fullName, companyName: client.companyName, phone: client.phone, whatsapp: client.whatsapp, email: client.email }))} meetingTypes={adminMeetingTypes} meetingStatuses={adminMeetingStatuses} services={services} />

      <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-3">
        <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{adminMeetingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        <input className={inputClass} defaultValue={params.date || ""} name="date" type="date" />
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
      </form>

      <div className="mb-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Today meetings</p>
        <p className="mt-2 text-3xl font-black">{bookings.filter((booking) => booking.startTime.toISOString().startsWith(today)).length}</p>
      </div>

      <div className="grid gap-4" id="meetings-list">
        {params.error === "google-config" ? <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Google Meet cannot be generated yet. Add GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and CALENDAR_ID in Vercel, then share the Google Calendar with the service account email.</div> : null}
        {filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No meetings found.</p> : null}
        {filtered.map((booking) => (
          <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.meetingType}</p>
                <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2>
              </div>
              <form action={deleteMeetingAction}>
                <input name="bookingId" type="hidden" value={booking.id} />
                <ConfirmSubmit message="Delete this meeting permanently? This will also cancel the Google Calendar event if one exists.">Delete</ConfirmSubmit>
              </form>
            </div>
            <p className="mt-2 text-[#06111F]/60">{booking.serviceType} / {booking.status}</p>
            <MeetingTimingBadge startTime={booking.startTime} endTime={booking.endTime} />
            <p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p>
            {booking.meetingLocation ? <p className="text-[#06111F]/60">Location: {booking.meetingLocation}</p> : null}
            {booking.assignedTeamMember ? <p className="text-[#06111F]/60">Team: {booking.assignedTeamMember}</p> : null}
            {booking.meetingLink ? <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-[#0B7CFF]/5 p-3"><span className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Google Meet</span><a className="text-sm font-bold text-[#0B7CFF] underline" href={booking.meetingLink} target="_blank">Open link</a><CopyButton text={booking.meetingLink} /></div> : null}
            {!booking.meetingLink && booking.type === "GOOGLE_MEETING" && booking.status !== "CANCELLED" && googleConfigured ? <form action={generateGoogleMeetLinkAction} className="mt-3"><input name="bookingId" type="hidden" value={booking.id} /><button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Generate Google Meet link</button></form> : null}
            {!booking.meetingLink && booking.type === "GOOGLE_MEETING" && booking.status !== "CANCELLED" && !googleConfigured ? <p className="mt-3 w-fit rounded-[1rem] bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-600">Google Meet not configured in Vercel</p> : null}
            {!booking.meetingLink && booking.type === "GOOGLE_MEETING" && booking.status === "CANCELLED" ? <p className="mt-3 w-fit rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-600">No Meet link for cancelled meeting</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.status !== "CANCELLED" ? <>
                {booking.status !== "APPROVED" ? <form action={updateBookingStatusAction}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value="APPROVED" /><input name="returnTo" type="hidden" value="/admin/meetings" /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">Approve</button></form> : null}
                {booking.status !== "COMPLETED" ? <form action={updateBookingStatusAction}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value="COMPLETED" /><input name="returnTo" type="hidden" value="/admin/meetings" /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">Complete</button></form> : null}
                <form action={updateBookingStatusAction}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value="CANCELLED" /><input name="returnTo" type="hidden" value="/admin/meetings" /><ConfirmSubmit message="Cancel this meeting? This will also cancel the Google Calendar event if one exists.">Cancel Meeting</ConfirmSubmit></form>
              </> : <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-600">Meeting cancelled</span>}
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
