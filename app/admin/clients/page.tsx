import Link from "next/link";
import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Field, inputClass } from "@/components/form-fields";
import { createClientAction, deleteClientAction, updateClientAction } from "@/lib/actions";
import { getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { clientTypes, leadSources, pipelineStatuses } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; leadSource?: string; pipelineStatus?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q || "").trim().toLowerCase();
  const clients = await getClients();
  const filteredClients = clients.filter((client) => {
    const searchMatch = !query || [client.fullName, client.companyName, client.phone, client.whatsapp, client.email].some((value) => value?.toLowerCase().includes(query));
    const typeMatch = !params.type || client.clientType === params.type;
    const sourceMatch = !params.leadSource || client.leadSource === params.leadSource;
    const pipelineMatch = !params.pipelineStatus || client.pipelineStatus === params.pipelineStatus;
    return searchMatch && typeMatch && sourceMatch && pipelineMatch;
  });

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
        <Field label="Lead source"><select className={inputClass} name="leadSource"><option value="">Select source</option>{leadSources.map((source) => <option key={source}>{source}</option>)}</select></Field>
        <Field label="Pipeline status"><select className={inputClass} name="pipelineStatus"><option value="">New Lead</option>{pipelineStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
        <Field label="Assigned team member"><input className={inputClass} name="assignedTeamMember" /></Field>
        <Field label="Address"><input className={inputClass} name="address" /></Field>
        <Field label="Tax number"><input className={inputClass} name="taxId" /></Field>
        <Field label="Commercial registration number"><input className={inputClass} name="commercialRegistrationNumber" /></Field>
        <Field label="Notes"><textarea className={inputClass} name="notes" rows={4} /></Field>
        <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Save Client</button></div>
      </form>

      <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-4">
        <input className={inputClass} defaultValue={params.q || ""} name="q" placeholder="Search name, company, phone, WhatsApp, email" />
        <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">All types</option>{clientTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <select className={inputClass} defaultValue={params.leadSource || ""} name="leadSource"><option value="">All sources</option>{leadSources.map((source) => <option key={source}>{source}</option>)}</select>
        <select className={inputClass} defaultValue={params.pipelineStatus || ""} name="pipelineStatus"><option value="">All pipeline</option>{pipelineStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white md:col-span-4">Filter Clients</button>
      </form>

      <div className="overflow-hidden rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm">
        <div className="grid min-w-[1100px] grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1.1fr_0.8fr_0.9fr_1fr_0.7fr_0.8fr_0.9fr_1fr] gap-3 border-b border-[#06111F]/10 bg-[#F7F8FB] p-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#06111F]/45">
          <span>Name</span><span>Company</span><span>Phone</span><span>WhatsApp</span><span>Email</span><span>Type</span><span>Lead Source</span><span>Pipeline</span><span>Bookings</span><span>Revenue</span><span>Last Contact</span><span>Actions</span>
        </div>
        <div className="overflow-x-auto">
          {filteredClients.length === 0 ? <p className="p-6 text-sm font-bold text-[#06111F]/55">No clients found.</p> : null}
          {filteredClients.map((client) => {
            const revenue = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const lastBooking = client.bookings[0];
            return (
              <div className="grid min-w-[1100px] grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1.1fr_0.8fr_0.9fr_1fr_0.7fr_0.8fr_0.9fr_1fr] gap-3 border-b border-[#06111F]/10 p-4 text-sm font-bold text-[#06111F]/65" key={client.id}>
                <Link className="font-black text-[#06111F] hover:text-[#0B7CFF]" href={`/admin/clients/${client.id}`}>{client.fullName}</Link>
                <span>{client.companyName || "-"}</span>
                <span>{client.phone}</span>
                <span>{client.whatsapp || "-"}</span>
                <span>{client.email}</span>
                <span>{client.clientType || "-"}</span>
                <span>{client.leadSource || "-"}</span>
                <span className="w-fit rounded-full bg-[#0B7CFF]/10 px-3 py-1 text-xs text-[#0B7CFF]">{client.pipelineStatus || "New Lead"}</span>
                <span>{client.bookings.length}</span>
                <span>{revenue} EGP</span>
                <span>{lastBooking ? displayDate(lastBooking.startTime) : displayDate(client.updatedAt)}</span>
                <span className="flex flex-wrap gap-2">
                  <Link className="rounded-full border border-[#06111F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href={`/admin/clients/${client.id}`}>View</Link>
                  <details>
                    <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">Edit</summary>
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06111F]/20 p-5">
                      <form action={updateClientAction} className="mx-auto grid max-w-2xl gap-3 rounded-[2rem] bg-white p-6 shadow-2xl">
                        <input name="clientId" type="hidden" value={client.id} />
                        <input className={inputClass} defaultValue={client.fullName} name="fullName" required />
                        <input className={inputClass} defaultValue={client.companyName || ""} name="companyName" placeholder="Company" />
                        <input className={inputClass} defaultValue={client.phone} name="phone" required />
                        <input className={inputClass} defaultValue={client.whatsapp || ""} name="whatsapp" placeholder="WhatsApp" />
                        <input className={inputClass} defaultValue={client.email} name="email" required type="email" />
                        <select className={inputClass} defaultValue={client.clientType || ""} name="clientType"><option value="">Select type</option>{clientTypes.map((type) => <option key={type}>{type}</option>)}</select>
                        <select className={inputClass} defaultValue={client.leadSource || ""} name="leadSource"><option value="">Select source</option>{leadSources.map((source) => <option key={source}>{source}</option>)}</select>
                        <select className={inputClass} defaultValue={client.pipelineStatus || "New Lead"} name="pipelineStatus">{pipelineStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                        <input className={inputClass} defaultValue={client.assignedTeamMember || ""} name="assignedTeamMember" placeholder="Assigned team member" />
                        <input className={inputClass} defaultValue={client.address || ""} name="address" placeholder="Address" />
                        <input className={inputClass} defaultValue={client.taxId || ""} name="taxId" placeholder="Tax number" />
                        <input className={inputClass} defaultValue={client.commercialRegistrationNumber || ""} name="commercialRegistrationNumber" placeholder="Commercial registration number" />
                        <textarea className={inputClass} defaultValue={client.notes || ""} name="notes" placeholder="Notes" rows={4} />
                        <button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Update Client</button>
                      </form>
                    </div>
                  </details>
                  <form action={deleteClientAction}>
                    <input name="clientId" type="hidden" value={client.id} />
                    <ConfirmSubmit message="Delete this client and related bookings?">Delete</ConfirmSubmit>
                  </form>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
