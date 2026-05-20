import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createClientAction } from "@/lib/actions";
import { getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function ClientsPage() {
  await requireAdmin();
  const clients = await getClients();
  return (
    <AdminShell title="Clients">
      {!hasDatabase() ? <SetupNotice /> : null}
      <form action={createClientAction} className="mb-6 grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Manual client</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">Add Client</h2>
        </div>
        <Field label="Full name"><input className={inputClass} name="fullName" required /></Field>
        <Field label="Company name"><input className={inputClass} name="companyName" /></Field>
        <Field label="Phone"><input className={inputClass} name="phone" required /></Field>
        <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
        <Field label="Address"><input className={inputClass} name="address" /></Field>
        <Field label="National ID or tax ID"><input className={inputClass} name="taxId" /></Field>
        <Field label="Notes"><textarea className={inputClass} name="notes" rows={4} /></Field>
        <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Client</button></div>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={client.id}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Client</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">{client.fullName}</h2>
          <p className="mt-2 text-[#06111F]/60">{client.companyName || "No company"}</p>
          <p className="text-[#06111F]/60">{client.email} / {client.phone}</p>
          {client.address ? <p className="text-[#06111F]/60">{client.address}</p> : null}
          {client.taxId ? <p className="text-[#06111F]/60">Tax/National ID: {client.taxId}</p> : null}
          {client.notes ? <p className="mt-3 text-sm text-[#06111F]/55">{client.notes}</p> : null}
          <div className="mt-5 grid gap-2 text-sm text-[#06111F]/60">
            {client.bookings.map((booking) => <p key={booking.id}>{booking.type} - {booking.status}</p>)}
          </div>
        </article>)}
      </div>
    </AdminShell>
  );
}
