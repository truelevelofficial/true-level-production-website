import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getContentProductions, getWorkflowProjects } from "@/lib/admin-data";
import { createContentProductionAction, updateContentStageAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

const pipelineStages = [
  ["IDEA", "Idea", "bg-purple-100 text-purple-800"],
  ["SCRIPT", "Script", "bg-indigo-100 text-indigo-800"],
  ["PLANNING", "Planning", "bg-blue-100 text-blue-800"],
  ["PRODUCTION", "Production", "bg-red-100 text-red-800"],
  ["EDITING", "Editing", "bg-pink-100 text-pink-800"],
  ["REVIEW", "Review", "bg-yellow-100 text-yellow-800"],
  ["PUBLISHED", "Published", "bg-green-100 text-green-800"],
] as const;

const contentTypeColors: Record<string, string> = {
  REEL: "bg-pink-100 text-pink-800",
  TIKTOK: "bg-cyan-100 text-cyan-800",
  YOUTUBE: "bg-red-100 text-red-800",
  AD: "bg-amber-100 text-amber-800",
  PHOTOGRAPHY: "bg-blue-100 text-blue-800",
};

export default async function ContentPipelinePage() {
  await requireAdmin();
  const [productions, projects] = await Promise.all([getContentProductions(), getWorkflowProjects()]);

  return (
    <AdminShell title="Content Pipeline">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{productions.length} total pieces</p>
        <details className="group relative">
          <summary className="cursor-pointer rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#06111F]">+ New Content</summary>
          <form action={createContentProductionAction} className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
            <input className={inputClass} name="title" placeholder="Content title" required />
            <select className={`${inputClass} mt-2`} name="contentType">
              <option value="REEL">Reel</option>
              <option value="TIKTOK">TikTok</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="AD">Ad</option>
              <option value="PHOTOGRAPHY">Photography</option>
            </select>
            <select className={`${inputClass} mt-2`} name="stage">
              {pipelineStages.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
            </select>
            <input className={`${inputClass} mt-2`} name="platform" placeholder="Platform" />
            <select className={`${inputClass} mt-2`} name="projectId">
              <option value="">No project</option>
              {projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input className={`${inputClass} mt-2`} name="dueDate" type="date" />
            <textarea className={`${inputClass} mt-2`} name="notes" placeholder="Notes" rows={2} />
            <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Create</button>
          </form>
        </details>
      </div>

      <div className="grid auto-cols-[240px] grid-flow-col gap-4 overflow-x-auto pb-6" style={{ maxHeight: "calc(100vh - 260px)" }}>
        {pipelineStages.map(([stageId, stageLabel, stageColor]) => {
          const stageItems = productions.filter(p => p.stage === stageId);
          return (
            <div key={stageId} className="flex min-w-[220px] flex-col rounded-[1.6rem] border border-[#06111F]/10 bg-white/60 p-4">
              <div className={`mb-3 rounded-full px-3 py-1.5 text-center text-xs font-black uppercase tracking-[0.1em] ${stageColor}`}>
                {stageLabel} <span className="ml-1 opacity-50">{stageItems.length}</span>
              </div>
              <div className="grid flex-1 auto-rows-max gap-3 overflow-y-auto">
                {stageItems.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#06111F]/20">No items</p>
                ) : stageItems.map(item => (
                  <div key={item.id} className="rounded-[1.2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
                    <p className="text-sm font-black uppercase leading-tight tracking-[-0.02em]">{item.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${contentTypeColors[item.contentType] || "bg-gray-100 text-gray-600"}`}>{item.contentType}</span>
                      {item.platform && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-black text-gray-600">{item.platform}</span>}
                    </div>
                    {item.project && <p className="mt-1 text-[10px] text-[#0B7CFF]/60">→ {item.project.title}</p>}
                    {item.dueDate && (
                      <p className={`mt-1 text-[10px] ${new Date(item.dueDate) < new Date() ? "text-red-500/70" : "text-[#06111F]/40"}`}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <form action={updateContentStageAction} className="mt-2">
                      <input hidden name="id" value={item.id} />
                      <select name="stage" onChange={e => e.target.form?.requestSubmit()} className="w-full cursor-pointer rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-2 py-1.5 text-[9px] font-bold outline-none transition hover:border-[#0B7CFF]/40">
                        {pipelineStages.map(([v, en]) => <option key={v} value={v} selected={v === item.stage}>{en}</option>)}
                      </select>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
