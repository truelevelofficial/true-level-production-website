import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import Link from "next/link";
import { inputClass } from "@/components/form-fields";
import { updateBookingAction } from "@/lib/actions";
import { bookingStatuses, paymentStatuses } from "@/lib/constants";
import { displayDate } from "@/lib/dates";
import { getAdminSummary, getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { hasGoogleConfig } from "@/lib/google-calendar";

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; type?: string; status?: string; clientId?: string; paymentStatus?: string }> }) {
  try {
    await requireAdmin();
    const params = await searchParams;
    const hasFilters = Object.values(params).some(Boolean);
    const where: Record<string, unknown> = {};
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.clientId) where.clientId = params.clientId;
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
    if (params.from || params.to) where.startTime = { ...(params.from ? { gte: new Date(`${params.from}T00:00:00`) } : {}), ...(params.to ? { lte: new Date(`${params.to}T23:59:59`) } : {}) };
    const [summary, bookings, clients] = await Promise.all([getAdminSummary(), getBookings(where), getClients()]);
    const noData = !hasDatabase() || !summary;
    return (
      <AdminShell title="Management">
        {noData ? <SetupNotice /> : null}

        {summary ? <div className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">Financial Overview</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Revenue" value={`${summary.revenue.toLocaleString()} EGP`} text={`This month: ${summary.monthRevenue.toLocaleString()} EGP`} />
            <Card title="Expenses" value={`${summary.expenses.toLocaleString()} EGP`} text={`This month: ${summary.monthExpenses.toLocaleString()} EGP`} />
            <Card title="Net Profit" value={`${summary.profit.toLocaleString()} EGP`} text={summary.profit >= 0 ? "Profitable" : "Operating at loss"} />
            <Card title="Pending Payments" value={`${summary.pendingPayments.toLocaleString()} EGP`} />
          </div>
        </div> : null}

        {summary ? <div className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">Booking Overview</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="All Bookings" value={String(summary.bookings)} />
            <Card title="Pending" value={String(summary.pending)} />
            <Card title="Approved" value={String(summary.approved)} />
            <Card title="Completed" value={String(summary.completed)} />
            <Card title="Cancelled" value={String(summary.cancelled)} />
            <Card title="Today Meetings" value={String(summary.todayMeetings)} />
            <Card title="This Month Studio" value={String(summary.monthStudioBookings)} />
          </div>
        </div> : null}

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/clients">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Add Client</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Manually create a new client record</p>
            </Link>
            <Link className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/meetings">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Add Meeting</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Schedule a client meeting</p>
            </Link>
            <Link className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/studio">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Add Studio Booking</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Book studio time for a client</p>
            </Link>
            <Link className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/accounting">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Add Income / Expense</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Record a financial entry</p>
            </Link>
            <Link className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/contracts">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Generate Contract</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Create a new contract draft</p>
            </Link>
            <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/export/bookings">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Export Bookings CSV</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Download booking data as CSV</p>
            </a>
            <a className="rounded-[2rem] border border-[#06111F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0B7CFF]/40 hover:shadow-lg" href="/admin/export/accounting">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Export Accounting CSV</p>
              <p className="mt-2 text-xs text-[#06111F]/45">Download financial data as CSV</p>
            </a>
          </div>
        </div>

        {!noData && (bookings.length > 0 || hasFilters) ? <form className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">Filters</h2>
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
            <input className={inputClass} defaultValue={params.from || ""} name="from" type="date" placeholder="From date" />
            <input className={inputClass} defaultValue={params.to || ""} name="to" type="date" placeholder="To date" />
            <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">All types</option><option value="GOOGLE_MEETING">Google Meeting</option><option value="COMPANY_MEETING">Company Meeting</option><option value="STUDIO">Studio</option></select>
            <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
            <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
            <select className={inputClass} defaultValue={params.paymentStatus || ""} name="paymentStatus"><option value="">All payments</option>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
            <div className="flex gap-2">
              <button className="flex-1 rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
              <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/bookings">Reset</a>
            </div>
          </div>
        </form> : null}

        {!noData && bookings.length === 0 && !hasFilters ? (
          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">No bookings yet</h2>
            <p className="mt-2 text-sm text-[#06111F]/55">Bookings will appear here once clients schedule through the public booking page or you add them manually.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link className="rounded-[2rem] border border-[#06111F]/10 bg-[#F7F8FB] p-6 transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/meetings"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Meetings</p><p className="mt-2 text-lg font-black uppercase tracking-[-0.05em]">Add a meeting</p></Link>
              <Link className="rounded-[2rem] border border-[#06111F]/10 bg-[#F7F8FB] p-6 transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/admin/studio"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Studio</p><p className="mt-2 text-lg font-black uppercase tracking-[-0.05em]">Add a studio booking</p></Link>
              <Link className="rounded-[2rem] border border-[#06111F]/10 bg-[#F7F8FB] p-6 transition hover:-translate-y-1 hover:border-[#0B7CFF]/40" href="/book"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Public booking</p><p className="mt-2 text-lg font-black uppercase tracking-[-0.05em]">Test booking flow</p></Link>
            </div>
          </div>
        ) : null}

        {!noData && bookings.length === 0 && hasFilters ? (
          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">No matching bookings</h2>
            <p className="mt-2 text-sm text-[#06111F]/55">Try adjusting your filters or <a className="text-[#0B7CFF] underline" href="/admin/bookings">reset to see all bookings</a>.</p>
          </div>
        ) : null}

        {!noData && bookings.length > 0 ? <div className="grid gap-4">
          {bookings.map((booking) => <form action={updateBookingAction} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}>
            <input name="bookingId" type="hidden" value={booking.id} />
            <div className="grid gap-4 lg:grid-cols-8">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#0B7CFF]/10 px-3 py-1 text-xs font-black uppercase text-[#0B7CFF]">{booking.type.replace("_", " ")}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${booking.status === "COMPLETED" ? "bg-green-100 text-green-700" : booking.status === "CANCELLED" ? "bg-red-100 text-red-700" : booking.status === "APPROVED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{booking.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : booking.paymentStatus === "UNPAID" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{booking.paymentStatus?.replace("_", " ") || "N/A"}</span>
                </div>
                <h2 className="blur-sensitive mt-3 text-2xl font-black">{booking.client.fullName}</h2>
                <p className="blur-sensitive mt-1 text-sm text-[#06111F]/55">{booking.client.companyName} {booking.client.phone}</p>
                <p className="text-sm text-[#06111F]/55">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p>
                {booking.meetingLink ? <a className="mt-1 inline-block text-xs text-[#0B7CFF] underline" href={booking.meetingLink} target="_blank">Meeting link</a> : null}
              </div>
              <select className={inputClass} name="status" defaultValue={booking.status}>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}</select>
              <select className={inputClass} name="paymentStatus" defaultValue={booking.paymentStatus}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
              <input className={`${inputClass} blur-sensitive`} name="price" placeholder="Price" defaultValue={String(booking.price ?? "")} />
              <input className={`${inputClass} blur-sensitive`} name="deposit" placeholder="Deposit" defaultValue={String(booking.deposit ?? "")} />
              <input className={`${inputClass} blur-sensitive`} name="discount" placeholder="Discount" defaultValue={String(booking.discount ?? "")} />
              <input className={`${inputClass} lg:col-span-2`} name="meetingLink" placeholder="Meeting link" defaultValue={booking.meetingLink ?? ""} />
              <textarea className={`${inputClass} lg:col-span-2`} name="internalNotes" placeholder="Internal notes" defaultValue={booking.internalNotes ?? ""} />
              {!booking.meetingLink && booking.type === "GOOGLE_MEETING" && booking.status === "APPROVED" && hasGoogleConfig() ? <p className="text-xs text-[#0B7CFF] lg:col-span-2">Meet link will be auto-generated on save if Google Calendar is configured.</p> : null}
              <div className="lg:col-span-8 flex justify-end">
                <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20">Save</button>
              </div>
            </div>
          </form>)}
        </div> : null}
      </AdminShell>
    );
  } catch (error) {
    console.error(error);

    return (
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            name: error instanceof Error ? error.name : null,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            digest: (error as any)?.digest ?? null,
            cause: (error as any)?.cause ?? null
          },
          null,
          2
        )}
      </pre>
    );
  }
}
