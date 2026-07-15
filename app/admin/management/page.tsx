import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { uploadSiteMediaAction } from "@/lib/actions";
import fs from "fs";
import path from "path";

interface MediaAsset {
  key: string;
  path: string;
  label: string;
  description: string;
  usage: string;
  recommendedWidth: number;
  recommendedHeight: number;
  type: "image" | "video";
}

const siteMedia: MediaAsset[] = [
  { key: "hero-cyclorama", path: "/images/hero-cyclorama.png", label: "Hero Cyclorama", description: "Main hero section cyclorama card image", usage: "Homepage hero — left side card", recommendedWidth: 280, recommendedHeight: 400, type: "image" },
  { key: "hero-studio", path: "/images/hero-studio.png", label: "Hero Studio", description: "Main hero section studio card image", usage: "Homepage hero — right side top card", recommendedWidth: 320, recommendedHeight: 360, type: "image" },
  { key: "hero-production", path: "/images/hero-production.png", label: "Hero Production", description: "Main hero section podcast card image", usage: "Homepage hero — bottom center card", recommendedWidth: 360, recommendedHeight: 340, type: "image" },
  { key: "hero-set-location", path: "/images/hero-set-location.png", label: "Set Location", description: "Decorative set location background image", usage: "Homepage hero — right side decorative", recommendedWidth: 420, recommendedHeight: 420, type: "image" },
  { key: "studio-cyclorama", path: "/images/studio-cyclorama.jpg", label: "Studio Cyclorama", description: "Cyclorama studio setup photo", usage: "Studio section — cyclorama card", recommendedWidth: 600, recommendedHeight: 400, type: "image" },
];

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileInfo(assetPath: string): { exists: boolean; size: number; ext: string } | null {
  try {
    const fullPath = path.join(process.cwd(), "public", assetPath);
    if (!fs.existsSync(fullPath)) return { exists: false, size: 0, ext: path.extname(assetPath) };
    const stats = fs.statSync(fullPath);
    return { exists: true, size: stats.size, ext: path.extname(assetPath) };
  } catch {
    return null;
  }
}

export default async function ManagementPage() {
  await requireAdmin();

  return (
    <AdminShell title="Site Media">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Manage images and videos used across the website</p>
      </div>

      <div className="grid gap-5">
        {siteMedia.map((asset) => {
          const info = getFileInfo(asset.path);
          return (
            <div key={asset.key} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-lg font-black uppercase tracking-[-0.03em]">{asset.label}</h3>
                    {info?.exists ? (
                      <span className="rounded-full bg-green-100 px-3 py-0.5 text-[10px] font-bold text-green-700">Active</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-bold text-amber-700">Missing</span>
                    )}
                  </div>
                  <p className="text-sm text-[#06111F]/60">{asset.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Path</p>
                      <p className="mt-0.5 font-mono text-xs text-[#06111F]/70">{asset.path}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Size</p>
                      <p className="mt-0.5 text-xs text-[#06111F]/70">{info?.exists ? formatBytes(info.size) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Recommended</p>
                      <p className="mt-0.5 text-xs font-bold text-[#0B7CFF]">{asset.recommendedWidth} × {asset.recommendedHeight} px</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Usage</p>
                      <p className="mt-0.5 text-xs text-[#06111F]/70">{asset.usage}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-dashed border-[#06111F]/15 bg-[#F7F8FB] p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Upload new {asset.type}</p>
                    <form action={uploadSiteMediaAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="assetPath" value={asset.path} />
                      <input type="file" name="file" accept={asset.type === "image" ? "image/png,image/jpeg,image/webp" : "video/mp4,video/mov,video/webm"} className="block w-56 text-xs file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#0B7CFF]/10 file:px-4 file:py-2 file:text-xs file:font-black file:tracking-[0.08em] file:text-[#0B7CFF] file:transition hover:file:bg-[#0B7CFF]/20" required />
                      <button type="submit" className="rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#06111F]">Upload</button>
                    </form>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
                  {info?.exists ? (
                    <img alt={asset.label} src={asset.path} className="max-h-44 max-w-full rounded-xl object-contain shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-8 text-[#06111F]/30">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-xs font-bold">No file uploaded yet</p>
                      <p className="text-[10px]">{asset.recommendedWidth}×{asset.recommendedHeight}px recommended</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
