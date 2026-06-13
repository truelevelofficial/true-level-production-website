import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createAdminStudioBookingAction, updateBookingStatusAction } from "@/lib/actions";
import { getBookings, getClients, getStudioCalendar, getStudioRooms, getStudioEquipment, getCreators, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { adminStudioStatuses, paymentStatuses, studioDurationTypes, studioSetups } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ setup?: string; status?: string; date?: string; view?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const view = params.view || "bookings";
  const [bookings, clients, rooms, equipment, creators] = await Promise.all([getBookings({ type: "STUDIO" }), getClients(), getStudioRooms(), getStudioEquipment(), getCreators()]);
  const filtered = bookings.filter((booking) => (!params.setup || booking.studioSetup === params.setup) && (!params.status || booking.status === params.status) && (!params.date || booking.startTime.toISOString().startsWith(params.date)));

  const navigation = [
    ["bookings", "Bookings"],
    ["calendar", "Calendar"],
    ["rooms", "Rooms"],
    ["equipment", "Equipment"],
    ["creators", "Creators"],
  ] as const;

  return <AdminShell title="Studio Operations">{!hasDatabase() ? <SetupNotice /> : null}
    <div className="mb-6 flex flex-wrap gap-2">
      {navigation.map(([key, label]) => (
        <a key={key} href={`/admin/studio${key === "bookings" ? "" : `?view=${key}`}`} className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition ${view === key ? "bg-[#0B7CFF] text-white shadow-lg shadow-blue-500/20" : "border border-[#06111F]/10 text-[#06111F]/50 hover:border-[#0B7CFF] hover:text-[#0B7CFF]"}`}>{label}</a>
      ))}
    </div>

    {view === "bookings" ? (
      <>
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
        <div className="grid gap-4 md:grid-cols-2">{filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No studio bookings found.</p> : null}{filtered.map((booking) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={booking.id}><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{booking.studioSetup}</p><h2 className="blur-sensitive mt-2 text-3xl font-black uppercase tracking-[-0.05em]">{booking.client.fullName}</h2><p className="mt-2 text-[#06111F]/60">{booking.durationHours} hours / {booking.peopleCount} people / {booking.status}</p><p className="text-[#06111F]/60">{displayDate(booking.startTime)} - {displayDate(booking.endTime)}</p><p className="blur-sensitive text-[#06111F]/60">Price: {String(booking.price ?? 0)} EGP / Deposit: {String(booking.deposit ?? 0)} EGP / Remaining: {String(booking.remainingAmount ?? 0)} EGP</p><p className="mt-3 text-sm text-[#06111F]/55">{booking.bookingPurpose}</p><div className="mt-4 flex flex-wrap gap-2">{["APPROVED", "COMPLETED", "CANCELLED"].map((status) => <form action={updateBookingStatusAction} key={status}><input name="bookingId" type="hidden" value={booking.id} /><input name="status" type="hidden" value={status} /><button className="rounded-full border border-[#06111F]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]">{status}</button></form>)}</div></article>)}</div>
      </>
    ) : view === "calendar" ? (
      <CalendarView bookings={bookings} />
    ) : view === "rooms" ? (
      <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Facilities</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.05em]">Studio Rooms</h2>
          </div>
          <details className="group relative">
            <summary className="cursor-pointer rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">+ Add Room</summary>
            <form action="/admin/studio" method="dialog" className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
              <input className={inputClass} name="name" placeholder="Room name" required />
              <select className={`${inputClass} mt-2`} name="type"><option value="STUDIO">Studio</option><option value="CYCLORAMA">Cyclorama</option></select>
              <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white" formAction={"/admin/studio"} formMethod="dialog">Save</button>
            </form>
          </details>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {rooms.length > 0 ? rooms.map(r => (
            <div key={r.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
              <p className="text-sm font-black uppercase tracking-[-0.02em]">{r.name}</p>
              <p className="text-xs text-[#06111F]/40">{r.type} {r.isActive ? "" : "(inactive)"}</p>
            </div>
          )) : <p className="col-span-3 py-6 text-center text-sm text-[#06111F]/30">No rooms added yet</p>}
        </div>

        <div className="mt-8 mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Equipment</p>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.05em]">Studio Equipment</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {equipment.length > 0 ? equipment.map(e => (
            <div key={e.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3">
              <p className="text-xs font-bold uppercase tracking-[-0.01em]">{e.name}</p>
              {e.category && <p className="text-[10px] text-[#06111F]/40">{e.category}</p>}
            </div>
          )) : <p className="col-span-4 py-6 text-center text-sm text-[#06111F]/30">No equipment added yet</p>}
        </div>

        <div className="mt-8 mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Creators</p>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.05em]">Available Creators</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {creators.length > 0 ? creators.map(c => (
            <div key={c.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3">
              <p className="text-xs font-bold uppercase tracking-[-0.01em]">{c.name}</p>
              <p className="text-[10px] text-[#06111F]/40">{c.specialty || "General"}</p>
            </div>
          )) : <p className="col-span-4 py-6 text-center text-sm text-[#06111F]/30">No creators added yet</p>}
        </div>
      </div>
    ) : null}
  </AdminShell>;
}

function CalendarView({ bookings }: { bookings: any[] }) {
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const bookingsByDay: Record<number, any[]> = {};
  bookings.forEach(b => {
    const d = new Date(b.startTime);
    if (d.getMonth() === month && d.getFullYear() === year) {
      if (!bookingsByDay[d.getDate()]) bookingsByDay[d.getDate()] = [];
      bookingsByDay[d.getDate()].push(b);
    }
  });

  return (
    <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Studio Calendar</p>
        <p className="text-2xl font-black uppercase tracking-[-0.04em]">{months[month]} {year}</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(d => <p key={d} className="p-2 text-center text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">{d}</p>)}
        {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const dayBookings = bookingsByDay[day] || [];
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={day} className={`min-h-[80px] rounded-xl border p-1.5 transition ${isToday ? "border-[#0B7CFF] bg-[#0B7CFF]/5" : "border-[#06111F]/10 bg-[#F7F8FB] hover:border-[#0B7CFF]/30"}`}>
              <p className={`text-[11px] font-black ${isToday ? "text-[#0B7CFF]" : "text-[#06111F]/50"}`}>{day}</p>
              <div className="mt-1 grid gap-0.5">
                {dayBookings.slice(0, 3).map(b => (
                  <p key={b.id} className="truncate rounded bg-[#0B7CFF]/10 px-1 py-0.5 text-[8px] font-bold text-[#0B7CFF]">
                    {b.client?.fullName?.split(" ")[0] || "?"}
                  </p>
                ))}
                {dayBookings.length > 3 && <p className="text-[8px] text-[#06111F]/30">+{dayBookings.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
