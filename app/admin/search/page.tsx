import { AdminShell } from "@/components/admin-shell";
import { searchEntities, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q || "";
  const results = q ? await searchEntities(q) : null;
  const noData = !hasDatabase();

  return (
    <AdminShell title={`Search: "${q}"`}>
      {noData ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#06111F]/40">Database not configured</p>
        </div>
      ) : !q ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">Enter a search term</p>
          <p className="mt-2 text-sm text-[#06111F]/40">Use the search bar in the header or press ⌘K to search across all records.</p>
        </div>
      ) : !results || (!results.projects.length && !results.clients.length && !results.bookings.length && !results.quotations.length && !results.contracts.length && !results.tasks.length) ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No results</p>
          <p className="mt-2 text-sm text-[#06111F]/40">Nothing found for &quot;{q}&quot;</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {results.projects.length > 0 && (
            <Section title="Projects" count={results.projects.length}>
              {results.projects.map((p: any) => (
                <Link key={p.id} href={`/admin/workflow?project=${p.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[-0.02em]">{p.title}</p>
                    <p className="text-[11px] text-[#06111F]/40">{p.clientName || "No client"} &middot; {p.stage?.replace(/_/g, " ")}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
          {results.clients.length > 0 && (
            <Section title="Clients" count={results.clients.length}>
              {results.clients.map((c: any) => (
                <Link key={c.id} href="/admin/clients" className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="blur-sensitive text-sm font-bold uppercase tracking-[-0.02em]">{c.fullName}</p>
                    <p className="text-[11px] text-[#06111F]/40">{c.companyName || c.email}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
          {results.bookings.length > 0 && (
            <Section title="Bookings" count={results.bookings.length}>
              {results.bookings.map((b: any) => (
                <Link key={b.id} href="/admin/meetings" className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[-0.02em]">{b.type?.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-[#06111F]/40">{b.client?.fullName || "Unknown"} &middot; {b.status}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
          {results.quotations.length > 0 && (
            <Section title="Quotations" count={results.quotations.length}>
              {results.quotations.map((q: any) => (
                <Link key={q.id} href="/admin/quotations" className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[-0.02em]">{q.quotationNo || "Quotation"}</p>
                    <p className="text-[11px] text-[#06111F]/40">{q.client?.fullName || "Unknown"} &middot; {q.status}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
          {results.contracts.length > 0 && (
            <Section title="Contracts" count={results.contracts.length}>
              {results.contracts.map((c: any) => (
                <Link key={c.id} href="/admin/contracts" className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[-0.02em]">{c.title}</p>
                    <p className="text-[11px] text-[#06111F]/40">{c.client?.fullName || "Unknown"} &middot; {c.status}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
          {results.tasks.length > 0 && (
            <Section title="Tasks" count={results.tasks.length}>
              {results.tasks.map((t: any) => (
                <Link key={t.id} href={`/admin/workflow?project=${t.projectId}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#06111F]/10 bg-white p-4 transition hover:border-[#0B7CFF]/40">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[-0.02em]">{t.title}</p>
                    <p className="text-[11px] text-[#06111F]/40">{t.project?.title || "No project"} &middot; {t.status}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-bold text-[#0B7CFF]">View →</span>
                </Link>
              ))}
            </Section>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{title} ({count})</p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
