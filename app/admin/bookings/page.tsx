import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { updateBookingAction } from "@/lib/actions";
import { bookingStatuses, paymentStatuses } from "@/lib/constants";
import { displayDate } from "@/lib/dates";
import { getAdminSummary, getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { hasGoogleConfig } from "@/lib/google-calendar";

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; type?: string; status?: string; clientId?: string; paymentStatus?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;
  if (params.clientId) where.clientId = params.clientId;
  if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
  if (params.from || params.to) where.startTime = { ...(params.from ? { gte: new Date(`${params.from}T00:00:00`) } : {}), ...(params.to ? { lte: new Date(`${params.to}T23:59:59`) } : {}) };
  const [summary, bookings, clients] = await Promise.all([getAdminSummary(), getBookings(where), getClients()]);
  return (
    <AdminShell title="Management">
      {!hasDatabase() || !summary ? <div className="mb-6"><SetupNotice /></div> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card title="All bookings" value={String(summary?.bookings ?? 0)} />
        <Card title="Pending" value={String(summary?.pending ?? 0)} />
        <Card title="Approved" value={String(summary?.approved ?? 0)} />
        <Card title="Completed" value={String(summary?.completed ?? 0)} />
        <Card title="Cancelled" value={String(summary?.cancelled ?? 0)} />
        <Card title="Revenue" value={`${summary?.revenue ?? 0} EGP`} />
        <Card title="Expenses" value={`${summary?.expenses ?? 0} EGP`} />
        <Card title="Net profit" value={`${summary?.profit ?? 0} EGP`} />
        <Card title="Pending payments" value={`${summary?.pendingPayments ?? 0} EGP`} />
        <Card title="Today meetings" value={String(summary?.todayMeetings ?? 0)} />
        <Card title="This month studio" value={String(summary?.monthStudioBookings ?? 0)} />
        <Card title="This month revenue" value={`${summary?.monthRevenue ?? 0} EGP`} />
        <Card title="This month expenses" value={`${summary?.monthExpenses ?? 0} EGP`} />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/clients">Add client manually</a>
        <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/meetings">Add meeting manually</a>
        <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/studio">Add studio booking manually</a>
        <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting">Add income / expense</a>
        <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/contracts">Generate contract</a>
        <a className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/export/bookings">Export Bookings CSV</a>
        <a className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/export/accounting">Export Accounting CSV</a>
      </div>
      <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-6">
        <input className={inputClass} defaultValue={params.from || ""} name="from" type="date" />
        <input className={inputClass} defaultValue={params.to || ""} name="to" type="date" />
        <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">All types</option><option value="GOOGLE_MEETING">Google Meeting</option><option value="COMPANY_MEETING">Company Meeting</option><option value="STUDIO">Studio</option></select>
        <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
        <select className={inputClass} defaultValue={params.paymentStatus || ""} name="paymentStatus"><option value="">All payments</option>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white md:col-span-6">Filter</button>
      </form>
      {bookings.length === 0 ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/meetings"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Meetings</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">Manage client meetings</h2></a>
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/studio"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Studio</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">Manage studio rentals</h2></a>
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/accounting"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Accounting</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">Track money flow</h2></a>
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/clients"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Clients</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">View client records</h2></a>
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/contracts"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Contracts</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">Generate contract drafts</h2></a>
          <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/book"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Public booking</p><h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">Test booking flow</h2></a>
        </div>
      ) : null}
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
