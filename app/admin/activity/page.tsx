import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getActivityLogs } from "@/lib/admin-data";

interface Log { id: string; action: string; entityType: string; entityId: string | null; entityName: string | null; description: string | null; metadata: string | null; userId: string | null; userName: string | null; createdAt: Date }

export default async function ActivityPage() {
  await requireAdmin();
  const logs = await getActivityLogs(200);

  const actionColors: Record<string, string> = {
    created: "text-emerald-600 bg-emerald-50 border-emerald-200",
    updated: "text-blue-600 bg-blue-50 border-blue-200",
    deleted: "text-red-600 bg-red-50 border-red-200",
    approved: "text-green-600 bg-green-50 border-green-200",
    rejected: "text-rose-600 bg-rose-50 border-rose-200",
    completed: "text-teal-600 bg-teal-50 border-teal-200",
    archived: "text-gray-600 bg-gray-50 border-gray-200",
    payment: "text-purple-600 bg-purple-50 border-purple-200",
    login: "text-indigo-600 bg-indigo-50 border-indigo-200",
  };

  function getActionColor(action: string) {
    for (const [key, color] of Object.entries(actionColors)) {
      if (action.toLowerCase().includes(key)) return color;
    }
    return "text-[#06111F]/60 bg-[#F7F8FB] border-[#06111F]/10";
  }

  return (
    <AdminShell title="Activity Log">
      <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
        <div className="border-b border-[#06111F]/10 px-6 py-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{logs.length} events recorded</p>
        </div>
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No activity recorded yet</p>
            <p className="mt-2 text-sm text-[#06111F]/40">Actions across the system will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#06111F]/5">
            {logs.map((log: Log) => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 transition hover:bg-[#F7F8FB]/50">
                <div className={`mt-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${getActionColor(log.action)}`}>{log.action}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm font-bold text-[#06111F]">{log.entityName || log.entityType}</span>
                    <span className="text-[11px] text-[#06111F]/40">{log.entityType}</span>
                  </div>
                  {log.description && <p className="mt-0.5 text-xs text-[#06111F]/55">{log.description}</p>}
                  {log.metadata && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[10px] text-[#06111F]/25 hover:text-[#0B7CFF]">Details</summary>
                      <pre className="mt-1 overflow-auto rounded-lg bg-[#F7F8FB] p-2 text-[10px] text-[#06111F]/60">{JSON.stringify(JSON.parse(log.metadata), null, 2)}</pre>
                    </details>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-[#06111F]/40">{new Date(log.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-[#06111F]/30">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  {log.userName && <p className="mt-0.5 text-[10px] font-bold text-[#0B7CFF]/60">{log.userName}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
