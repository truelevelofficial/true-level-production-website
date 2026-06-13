import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { requireAdmin } from "@/lib/auth";
import { getFileAttachments, getProjectFolders, getWorkflowProjects } from "@/lib/admin-data";
import { createFileAttachmentAction, deleteFileAttachmentAction } from "@/lib/actions";

export default async function FilesPage() {
  await requireAdmin();
  const [files, folders, projects] = await Promise.all([getFileAttachments(), getProjectFolders(), getWorkflowProjects()]);

  const mimeIcons: Record<string, string> = {
    "image/": "🖼", "video/": "🎬", "audio/": "🎵", "application/pdf": "📄",
    "application/zip": "📦", "text/": "📝", "application/msword": "📝",
    "application/vnd.openxmlformats-officedocument": "📝",
    "application/vnd.ms-excel": "📊",
  };

  function getFileIcon(mime?: string | null) {
    if (!mime) return "📁";
    for (const [prefix, icon] of Object.entries(mimeIcons)) {
      if (mime.startsWith(prefix)) return icon;
    }
    return "📎";
  }

  function formatSize(size?: number | null) {
    if (!size) return "";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <AdminShell title="File Manager">
      <div className="mb-6 rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <details className="group">
          <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] transition hover:text-[#06111F]">+ Add File Link</summary>
          <form action={createFileAttachmentAction} className="mt-4 grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">File Name *</label>
              <input className={inputClass} name="fileName" required />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">URL (Google Drive, Dropbox, etc.)</label>
              <input className={inputClass} name="url" type="url" placeholder="https://..." />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Project</label>
              <select className={inputClass} name="projectId">
                <option value="">— No project —</option>
                {projects.filter((p: any) => !p.archived).map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Folder</label>
              <select className={inputClass} name="folder">
                <option value="General">General</option>
                <option value="Contracts">Contracts</option>
                <option value="Deliverables">Deliverables</option>
                <option value="Invoices">Invoices</option>
                <option value="Briefs">Briefs</option>
                <option value="Scripts">Scripts</option>
                <option value="Raw Footage">Raw Footage</option>
                <option value="Finished">Finished</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Notes</label>
              <input className={inputClass} name="notes" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">MIME Type / Size info</label>
              <div className="flex gap-2">
                <input className={inputClass} name="mimeType" placeholder="e.g. application/pdf" />
                <input className={inputClass} name="fileSize" type="number" placeholder="Size in bytes" />
              </div>
            </div>
            <div className="md:col-span-4">
              <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Add File</button>
            </div>
          </form>
        </details>
      </div>

      {folders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {folders.map((f: string) => (
            <a key={f} href={`/admin/files?folder=${encodeURIComponent(f)}`} className="rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/50 shadow-sm ring-1 ring-[#06111F]/10 transition hover:ring-[#0B7CFF]/40 hover:text-[#0B7CFF]">{f}</a>
          ))}
        </div>
      )}

      {files.length === 0 ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No files yet</p>
          <p className="mt-2 text-sm text-[#06111F]/40">Add file links to organize project deliverables.</p>
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Folder</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#06111F]/5">
                {files.map((file: any) => (
                  <tr key={file.id} className="group transition hover:bg-[#F7F8FB]/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                        <div>
                          <a href={file.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#06111F] transition hover:text-[#0B7CFF]">{file.fileName}</a>
                          {file.notes && <p className="text-[11px] text-[#06111F]/45">{file.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#06111F]/60">{file.projectId ? <a href={`/admin/workflow?project=${file.projectId}`} className="transition hover:text-[#0B7CFF]">View Project</a> : "—"}</td>
                    <td className="px-5 py-3"><span className="rounded-full bg-[#F7F8FB] px-2.5 py-1 text-[10px] font-bold text-[#06111F]/50">{file.folder || "General"}</span></td>
                    <td className="px-5 py-3 text-sm text-[#06111F]/50">{formatSize(file.fileSize)}</td>
                    <td className="px-5 py-3 text-sm text-[#06111F]/50">{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <form action={deleteFileAttachmentAction} onSubmit={e => { if (!confirm("Delete this file?")) e.preventDefault(); }}>
                        <input hidden name="id" value={file.id} />
                        <button className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-red-400 opacity-0 transition hover:bg-red-100 hover:text-red-600 group-hover:opacity-100">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
