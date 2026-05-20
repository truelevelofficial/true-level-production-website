import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function ClientsPage() {
  await requireAdmin();
  const clients = await getClients();
  return (
    <AdminShell title="Clients">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={client.id}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Client</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">{client.fullName}</h2>
          <p className="mt-2 text-[#06111F]/60">{client.companyName || "No company"}</p>
          <p className="text-[#06111F]/60">{client.email} / {client.phone}</p>
          <div className="mt-5 grid gap-2 text-sm text-[#06111F]/60">
            {client.bookings.map((booking) => <p key={booking.id}>{booking.type} - {booking.status}</p>)}
          </div>
        </article>)}
      </div>
    </AdminShell>
  );
}
