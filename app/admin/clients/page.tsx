import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Field, inputClass } from "@/components/form-fields";
import { createClientAction, deleteClientAction, updateClientAction } from "@/lib/actions";
import { getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { clientTypes } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q || "").trim().toLowerCase();
  const clients = await getClients();
  const filteredClients = query
    ? clients.filter((client) => [client.fullName, client.companyName, client.phone, client.whatsapp, client.email].some((value) => value?.toLowerCase().includes(query)))
    : clients;
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
        <Field label="WhatsApp"><input className={inputClass} name="whatsapp" /></Field>
        <Field label="Email"><input className={inputClass} name="email" required type="email" /></Field>
        <Field label="Client type"><select className={inputClass} name="clientType"><option value="">Select type</option>{clientTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="Address"><input className={inputClass} name="address" /></Field>
        <Field label="National ID or tax ID"><input className={inputClass} name="taxId" /></Field>
        <Field label="Notes"><textarea className={inputClass} name="notes" rows={4} /></Field>
        <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Client</button></div>
      </form>

      <form className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <input className={inputClass} defaultValue={params.q || ""} name="q" placeholder="Search by name, company, phone, WhatsApp, or email" />
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredClients.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No clients found.</p> : null}
        {filteredClients.map((client) => {
          const revenue = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
          const lastBooking = client.bookings[0];
          return <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={client.id}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Client</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">{client.fullName}</h2>
          <p className="mt-2 text-[#06111F]/60">{client.companyName || "No company"}</p>
          <p className="text-[#06111F]/60">{client.email} / {client.phone}{client.whatsapp ? ` / WhatsApp: ${client.whatsapp}` : ""}</p>
          {client.clientType ? <p className="text-[#06111F]/60">Type: {client.clientType}</p> : null}
          {client.address ? <p className="text-[#06111F]/60">{client.address}</p> : null}
          {client.taxId ? <p className="text-[#06111F]/60">Tax/National ID: {client.taxId}</p> : null}
          {client.notes ? <p className="mt-3 text-sm text-[#06111F]/55">{client.notes}</p> : null}
          <div className="mt-5 grid gap-2 rounded-2xl bg-[#F7F8FB] p-4 text-sm font-bold text-[#06111F]/60">
            <p>Total bookings: {client.bookings.length}</p>
            <p>Total revenue: {revenue} EGP</p>
            <p>Last booking: {lastBooking ? displayDate(lastBooking.startTime) : "None"}</p>
            <p>Contracts: {client.contracts.length}</p>
          </div>
          <div className="mt-5 grid gap-2 text-sm text-[#06111F]/60">
            {client.bookings.map((booking) => <p key={booking.id}>{booking.type} - {booking.status}</p>)}
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">Edit client</summary>
            <form action={updateClientAction} className="mt-4 grid gap-3">
              <input name="clientId" type="hidden" value={client.id} />
              <input className={inputClass} defaultValue={client.fullName} name="fullName" required />
              <input className={inputClass} defaultValue={client.companyName || ""} name="companyName" placeholder="Company" />
              <input className={inputClass} defaultValue={client.phone} name="phone" required />
              <input className={inputClass} defaultValue={client.whatsapp || ""} name="whatsapp" placeholder="WhatsApp" />
              <input className={inputClass} defaultValue={client.email} name="email" required type="email" />
              <select className={inputClass} defaultValue={client.clientType || ""} name="clientType"><option value="">Select type</option>{clientTypes.map((type) => <option key={type}>{type}</option>)}</select>
              <input className={inputClass} defaultValue={client.address || ""} name="address" placeholder="Address" />
              <input className={inputClass} defaultValue={client.taxId || ""} name="taxId" placeholder="Tax/National ID" />
              <textarea className={inputClass} defaultValue={client.notes || ""} name="notes" placeholder="Notes" rows={3} />
              <button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Update Client</button>
            </form>
            <form action={deleteClientAction} className="mt-3">
              <input name="clientId" type="hidden" value={client.id} />
              <ConfirmSubmit message="Delete this client and all related bookings?">Delete Client</ConfirmSubmit>
            </form>
          </details>
        </article>;
        })}
      </div>
    </AdminShell>
  );
}
