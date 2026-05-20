import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { updateBookingAction } from "@/lib/actions";
import { bookingStatuses, paymentStatuses } from "@/lib/constants";
import { displayDate } from "@/lib/dates";
import { getAdminSummary, getBookings, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { hasGoogleConfig } from "@/lib/google-calendar";

export default async function AdminBookingsPage() {
  await requireAdmin();
  const [summary, bookings] = await Promise.all([getAdminSummary(), getBookings()]);
  return (
    <AdminShell title="Bookings">
      {!hasDatabase() ? <SetupNotice /> : null}
      {summary ? <div className="mb-6 grid gap-4 md:grid-cols-4"><Card title="All bookings" value={String(summary.bookings)} /><Card title="Pending" value={String(summary.pending)} /><Card title="Revenue" value={`${summary.revenue} EGP`} /><Card title="Net profit" value={`${summary.profit} EGP`} /></div> : null}
      <a className="mb-4 inline-flex rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/export/bookings">Export Bookings CSV</a>
      <div className="grid gap-4">
        {bookings.map((booking) => <form action={updateBookingAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm lg:grid-cols-6" key={booking.id}>
          <input name="bookingId" type="hidden" value={booking.id} />
          <div className="lg:col-span-2">
            <p className="text-xs font-black uppercase text-[#0B7CFF]">{booking.type} / {booking.status}</p>
            <h2 className="text-2xl font-black">{booking.client.fullName}</h2>
            <p className="text-sm text-[#06111F]/55">{booking.client.companyName} {booking.client.phone}</p>
            <p className="text-sm text-[#06111F]/55">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p>
            {booking.meetingLink ? <a className="text-xs text-[#0B7CFF]" href={booking.meetingLink} target="_blank">Meeting link</a> : null}
          </div>
          <select className={inputClass} name="status" defaultValue={booking.status}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
          <select className={inputClass} name="paymentStatus" defaultValue={booking.paymentStatus}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
          <input className={inputClass} name="price" placeholder="Price" defaultValue={String(booking.price ?? "")} />
          <input className={inputClass} name="deposit" placeholder="Deposit" defaultValue={String(booking.deposit ?? "")} />
          <input className={inputClass} name="discount" placeholder="Discount" defaultValue={String(booking.discount ?? "")} />
          <input className={`${inputClass} lg:col-span-2`} name="meetingLink" placeholder="Meeting link" defaultValue={booking.meetingLink ?? ""} />
          <textarea className={`${inputClass} lg:col-span-2`} name="internalNotes" placeholder="Internal notes" defaultValue={booking.internalNotes ?? ""} />
          {!booking.meetingLink && booking.type === "GOOGLE_MEETING" && booking.status === "APPROVED" && hasGoogleConfig() ? <p className="text-xs text-[#0B7CFF] lg:col-span-2">Meet link will be auto-generated on save if Google Calendar is configured.</p> : null}
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save</button>
        </form>)}
      </div>
    </AdminShell>
  );
}
