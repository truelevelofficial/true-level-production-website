import { requirePortalAuth } from "@/lib/portal-auth";
import { getPortalDeliverables, getPortalQuotations, getPortalContracts, getPortalInvoices, getPortalProjects } from "@/lib/admin-data";
import { portalLogoutAction } from "@/lib/actions";
import Link from "next/link";

export default async function PortalDashboardPage() {
  const user = await requirePortalAuth();
  const clientName = user.client.fullName;
  const companyName = user.client.companyName;
  const [deliverables, quotations, contracts, invoices, projects] = await Promise.all([
    getPortalDeliverables(clientName),
    getPortalQuotations(user.clientId),
    getPortalContracts(user.clientId),
    getPortalInvoices(user.clientId),
    getPortalProjects(clientName),
  ]);

  const activeProjects = projects.filter((p: any) => !["ARCHIVED"].includes(p.stage));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Client Portal</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-[-0.04em]">Welcome, {companyName || clientName}</h1>
        </div>
        <form action={portalLogoutAction}>
          <button className="rounded-full bg-[#06111F] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white/60 transition hover:text-white">Sign Out</button>
        </form>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalCard label="Active Projects" value={String(activeProjects.length)} />
        <PortalCard label="Deliverables" value={String(deliverables.length)} />
        <PortalCard label="Quotations" value={String(quotations.length)} />
        <PortalCard label="Invoices" value={String(invoices.length)} />
      </div>

      {activeProjects.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#06111F]/40">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.map((p: any) => (
              <div key={p.id} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="text-lg font-black uppercase tracking-[-0.02em]">{p.title}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">{p.stage?.replace(/_/g, " ")}</span>
                  {p.dueDate && <span className="text-[11px] text-[#06111F]/45">Due: {new Date(p.dueDate).toLocaleDateString()}</span>}
                </div>
                {(p as any).fileAttachments?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/30">Attached Files</p>
                    <div className="mt-1 space-y-1">
                      {(p as any).fileAttachments.map((f: any) => (
                        <a key={f.id} href={f.url || "#"} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#0B7CFF] transition hover:underline">{f.fileName}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {deliverables.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#06111F]/40">Deliverables</h2>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
            {deliverables.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between border-b border-[#06111F]/5 px-5 py-3 last:border-0">
                <div>
                  <p className="text-sm font-bold">{d.title}</p>
                  <p className="text-[11px] text-[#06111F]/45">{(d as any).project?.title} • {d.deliverableType || ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-700">{d.status}</span>
                  {d.deliveryLink && (
                    <a href={d.deliveryLink} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#0B7CFF] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#06111F]">Download</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {quotations.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#06111F]/40">Quotations</h2>
            <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
              {quotations.map((q: any) => (
                <div key={q.id} className="flex items-center justify-between border-b border-[#06111F]/5 px-5 py-3 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{(q as any).quotationNo || "Quotation"}</p>
                    <p className="text-[11px] text-[#06111F]/45">{new Date(q.createdAt).toLocaleDateString()} • {(q as any).grandTotal?.toLocaleString()} EGP</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700">{q.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {invoices.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#06111F]/40">Invoices</h2>
            <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-[#06111F]/5 px-5 py-3 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{(inv as any).invoiceNo}</p>
                    <p className="text-[11px] text-[#06111F]/45">{new Date(inv.createdAt).toLocaleDateString()} • {(inv as any).total?.toLocaleString()} EGP</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">{inv.paymentStatus}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {contracts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[#06111F]/40">Contracts</h2>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
            {contracts.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between border-b border-[#06111F]/5 px-5 py-3 last:border-0">
                <div>
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="text-[11px] text-[#06111F]/45">{c.type?.replace(/_/g, " ")} • {c.totalPrice?.toLocaleString()} EGP</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${c.status === "SIGNED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PortalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#0B7CFF]">{value}</p>
    </div>
  );
}
