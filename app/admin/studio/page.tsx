import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createAdminStudioBookingAction, updateBookingStatusAction } from "@/lib/actions";
import { getBookings, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { adminStudioStatuses, paymentStatuses, studioDurationTypes, studioSetups } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ setup?: string; status?: string; date?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [bookings, clients] = await Promise.all([getBookings({ type: "STUDIO" }), getClients()]);
  const filtered = bookings.filter((booking) => (!params.setup || booking.studioSetup === params.setup) && (!params.status || booking.status === params.status) && (!params.date || booking.startTime.toISOString().startsWith(params.date)));
  return <AdminShell title="Studio Management">{!hasDatabase() ? <SetupNotice /> : null}
    <form action={createAdminStudioBookingAction} className="mb-6 grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Manual studio booking</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Add Studio Booking</h2></div>
      <Field label="Existing client"><select className={inputClass} name="clientId"><option value="">Create/link by email</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName} - {client.email}</option>)}</select></Field>
      <Field label="Client name"><input className={inputClass} name="fullName" required /></Field>
      <Field label="Company"><input className={inputClass} name="companyName" /></Field>
      <Field label="Phone"><input className={inputClass} name="phone" required /></Field>
      <Field label="WhatsApp"><input className={inputClass} name="whatsapp" /></Field>
      <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
      <Field label="Setup"><select className={inputClass} name="studioSetup">{studioSetups.map((setup) => <option key={setup}>{setup}</option>)}</select></Field>
      <Field label="Status"><select className={inputClass} name="status">{adminStudioStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
      <Field label="Payment status"><select className={inputClass} name="paymentStatus">{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
      <Field label="Date"><input className={inputClass} name="date" required type="date" /></Field>
      <Field label="Start time"><input className={inputClass} name="startTime" required type="time" /></Field>
      <Field label="Booking type"><select className={inputClass} name="durationType">{studioDurationTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
      <Field label="Hours"><input className={inputClass} defaultValue="1" min="1" max="12" name="durationHours" type="number" /></Field>
      <Field label="People count"><input className={inputClass} defaultValue="1" min="1" name="peopleCount" type="number" /></Field>
      <Field label="Purpose"><input className={inputClass} name="bookingPurpose" required /></Field>
      <Field label="Price"><input className={inputClass} defaultValue="0" name="price" type="number" /></Field>
      <Field label="Deposit"><input className={inputClass} defaultValue="0" name="deposit" type="number" /></Field>
      <Field label="Notes"><textarea className={inputClass} name="notes" rows={3} /></Field>
      <Field label="Internal notes"><textarea className={inputClass} name="internalNotes" rows={3} /></Field>
      <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Studio Booking</button></div>
    </form>
    <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-4">
      <select className={inputClass} defaultValue={params.setup || ""} name="setup"><option value="">All setups</option>{studioSetups.map((setup) => <option key={setup}>{setup}</option>)}</select>
      <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">All statuses</option>{adminStudioStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      <input className={inputClass} defaultValue={params.date || ""} name="date" type="date" />
      <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
    </form>
    <div className="grid gap-4 md:grid-cols-2">{filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No studio bookings found.</p> : null}{filtered.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.studioSetup}</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.durationHours} hours / {booking.peopleCount} people / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p><p className="text-[#06111F]/60">Price: {String(booking.price ?? 0)} EGP / Deposit: {String(booking.deposit ?? 0)} EGP / Remaining: {String(booking.remainingAmount ?? 0)} EGP</p><p className="mt-3 text-sm text-[#06111F]/55">{booking.bookingPurpose}</p><div className="mt-4 flex flex-wrap gap-2">{["APPROVED", "COMPLETED", "CANCELLED"].map((status) => <form action={updateBookingStatusAction} key={status}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value={status} /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">{status}</button></form>)}</div></article>)}</div>
  </AdminShell>;
}
