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
  group: string;
}

const siteMedia: MediaAsset[] = [
  // ── Logos ──
  { key: "logo-color", path: "/true-level-production-logo.png", label: "Logo Color", description: "Full color company logo", usage: "Header navbar — all pages", recommendedWidth: 220, recommendedHeight: 120, type: "image", group: "logos" },
  { key: "logo-black", path: "/true-level-logo-black.png", label: "Logo Black", description: "Black company logo for documents", usage: "Contract preview, quotation PDF, invoice PDF", recommendedWidth: 220, recommendedHeight: 120, type: "image", group: "logos" },
  { key: "logo-black-svg", path: "/true-level-logo-black.svg", label: "Logo Black SVG", description: "SVG vector version of black logo", usage: "Not currently used — available for future use", recommendedWidth: 220, recommendedHeight: 120, type: "image", group: "logos" },
  { key: "logo-production-badge", path: "/black-logo-production.png", label: "Production Badge", description: "Production badge variant", usage: "Not currently used — available for future use", recommendedWidth: 200, recommendedHeight: 100, type: "image", group: "logos" },

  // ── Hero Slider ──
  { key: "hero-slider-01", path: "/images/hero-production-01.jpg", label: "Hero Slider 01", description: "Slider image — production set scene", usage: "Hero slider — auto-rotating background (slide 1)", recommendedWidth: 1920, recommendedHeight: 1080, type: "image", group: "hero-slider" },
  { key: "hero-slider-02", path: "/images/hero-production-02.jpg", label: "Hero Slider 02", description: "Slider image — studio session scene", usage: "Hero slider — auto-rotating background (slide 2)", recommendedWidth: 1920, recommendedHeight: 1080, type: "image", group: "hero-slider" },
  { key: "hero-slider-03", path: "/images/hero-production-03.jpg", label: "Hero Slider 03", description: "Slider image — content creation scene", usage: "Hero slider — auto-rotating background (slide 3)", recommendedWidth: 1920, recommendedHeight: 1080, type: "image", group: "hero-slider" },

  // ── Hero Visual Cards ──
  { key: "hero-cyclorama", path: "/images/hero-cyclorama.png", label: "Hero Cyclorama Card", description: "Cyclorama studio showcase image", usage: "Homepage hero — left side card", recommendedWidth: 280, recommendedHeight: 400, type: "image", group: "hero-cards" },
  { key: "hero-studio", path: "/images/hero-studio.png", label: "Hero Studio Card", description: "Studio setup showcase image", usage: "Homepage hero — right side top card", recommendedWidth: 320, recommendedHeight: 360, type: "image", group: "hero-cards" },
  { key: "hero-production", path: "/images/hero-production.png", label: "Hero Production Card", description: "Production/podcast studio image", usage: "Homepage hero — bottom center card", recommendedWidth: 360, recommendedHeight: 340, type: "image", group: "hero-cards" },
  { key: "hero-set-location", path: "/images/hero-set-location.png", label: "Hero Set Location", description: "Decorative set location background", usage: "Homepage hero — right side decorative", recommendedWidth: 420, recommendedHeight: 420, type: "image", group: "hero-cards" },

  // ── Services Section ──
  { key: "service-brand-films-image", path: "/images/service-brand-films.png", label: "Svc Image — Brand Films", description: "Brand films service card image (poster for video if used)", usage: "Homepage services — Brand Films card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-brand-films-video", path: "/videos/service-brand-films.mp4", label: "Svc Video — Brand Films", description: "Brand films background video (auto-plays muted on card)", usage: "Homepage services — Brand Films card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },
  { key: "service-creative-direction-image", path: "/images/service-creative-direction.png", label: "Svc Image — Creative Direction", description: "Creative direction service card image", usage: "Homepage services — Creative Direction card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-creative-direction-video", path: "/videos/service-creative-direction.mp4", label: "Svc Video — Creative Direction", description: "Creative direction background video (auto-plays muted)", usage: "Homepage services — Creative Direction card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },
  { key: "service-ugc-content-image", path: "/images/service-ugc-content.png", label: "Svc Image — UGC Content", description: "UGC content service card image", usage: "Homepage services — UGC Content card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-ugc-content-video", path: "/videos/service-ugc-content.mp4", label: "Svc Video — UGC Content", description: "UGC content background video (auto-plays muted)", usage: "Homepage services — UGC Content card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },
  { key: "service-studio-shoots-image", path: "/images/service-studio-shoots.png", label: "Svc Image — Studio Shoots", description: "Studio shoots service card image", usage: "Homepage services — Studio Shoots card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-studio-shoots-video", path: "/videos/service-studio-shoots.mp4", label: "Svc Video — Studio Shoots", description: "Studio shoots background video (auto-plays muted)", usage: "Homepage services — Studio Shoots card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },
  { key: "service-event-coverage-image", path: "/images/service-event-coverage.png", label: "Svc Image — Event Coverage", description: "Event coverage service card image", usage: "Homepage services — Event Coverage card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-event-coverage-video", path: "/videos/service-event-coverage.mp4", label: "Svc Video — Event Coverage", description: "Event coverage background video (auto-plays muted)", usage: "Homepage services — Event Coverage card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },
  { key: "service-campaign-assets-image", path: "/images/service-campaign-assets.png", label: "Svc Image — Campaign Assets", description: "Campaign assets service card image", usage: "Homepage services — Campaign Assets card", recommendedWidth: 400, recommendedHeight: 300, type: "image", group: "services" },
  { key: "service-campaign-assets-video", path: "/videos/service-campaign-assets.mp4", label: "Svc Video — Campaign Assets", description: "Campaign assets background video (auto-plays muted)", usage: "Homepage services — Campaign Assets card", recommendedWidth: 1080, recommendedHeight: 1920, type: "video", group: "services" },

  // ── Studio Setups Section ──
  { key: "studio-cyclorama", path: "/images/studio-cyclorama.jpg", label: "Studio — Cyclorama", description: "Cyclorama studio setup photo", usage: "Homepage studio setups — Cyclorama card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },
  { key: "studio-creator-corners", path: "/images/studio-creator-corners.png", label: "Studio — Creator Corners", description: "Creator corners setup photo", usage: "Homepage studio setups — Creator Corners card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },
  { key: "studio-product-zone", path: "/images/studio-product-zone.png", label: "Studio — Product Zone", description: "Product zone setup photo", usage: "Homepage studio setups — Product Zone card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },
  { key: "studio-podcast-look", path: "/images/studio-podcast-look.png", label: "Studio — Podcast Look", description: "Podcast setup photo", usage: "Homepage studio setups — Podcast Look card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },
  { key: "studio-lifestyle-sets", path: "/images/studio-lifestyle-sets.png", label: "Studio — Lifestyle Sets", description: "Lifestyle sets setup photo", usage: "Homepage studio setups — Lifestyle Sets card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },
  { key: "studio-lighting-ready", path: "/images/studio-lighting-ready.png", label: "Studio — Lighting Ready", description: "Lighting ready setup photo", usage: "Homepage studio setups — Lighting Ready card", recommendedWidth: 600, recommendedHeight: 400, type: "image", group: "studio-setups" },

  // ── Package Menu Images ──
  { key: "package-studio-rent", path: "/images/package-studio-rent.png", label: "Package — Studio Rent", description: "Studio rent package menu image", usage: "Footer packages menu + FlowingMenu", recommendedWidth: 480, recommendedHeight: 360, type: "image", group: "packages" },
  { key: "package-content-creators", path: "/images/package-content-creators.png", label: "Package — Content Creators", description: "Content creators campaign menu image", usage: "Footer packages menu + FlowingMenu", recommendedWidth: 480, recommendedHeight: 360, type: "image", group: "packages" },
  { key: "package-event-production", path: "/images/package-event-production.png", label: "Package — Event Production", description: "Event production package menu image", usage: "Footer packages menu + FlowingMenu", recommendedWidth: 480, recommendedHeight: 360, type: "image", group: "packages" },
  { key: "package-ugc-campaign", path: "/images/package-ugc-campaign.png", label: "Package — UGC Campaign", description: "UGC campaign package menu image", usage: "Footer packages menu + FlowingMenu", recommendedWidth: 480, recommendedHeight: 360, type: "image", group: "packages" },
  { key: "package-monthly-marketing", path: "/images/package-monthly-marketing.png", label: "Package — Monthly Marketing", description: "Monthly marketing campaign menu image", usage: "Footer packages menu + FlowingMenu", recommendedWidth: 480, recommendedHeight: 360, type: "image", group: "packages" },

  // ── Favicon ──
  { key: "favicon-svg", path: "/icon.svg", label: "Favicon SVG", description: "Browser tab icon (SVG)", usage: "All pages — browser tab", recommendedWidth: 48, recommendedHeight: 48, type: "image", group: "favicon" },
  { key: "favicon-ico", path: "/favicon.ico", label: "Favicon ICO", description: "Browser tab icon (fallback)", usage: "All pages — browser tab fallback", recommendedWidth: 32, recommendedHeight: 32, type: "image", group: "favicon" },
];

const groupNames: Record<string, { label: string; description: string }> = {
  "logos": { label: "Logos", description: "Company logos used across the site" },
  "hero-slider": { label: "Hero Slider", description: "Background images for the auto-rotating hero slider — ALL currently missing (add 1920×1080 images)" },
  "hero-cards": { label: "Hero Visual Cards", description: "Card images in the main hero section" },
  "services": { label: "Services Section", description: "Card images (posters) and background videos for the 6 services — each can have an image, a video, or both" },
  "studio-setups": { label: "Studio Setups", description: "Studio setup cards — only Cyclorama has an image" },
  "packages": { label: "Package Menu Images", description: "Images for the footer packages menu — ALL currently empty" },
  "favicon": { label: "Favicons", description: "Browser tab icons" },
};

const groupOrder = ["logos", "hero-slider", "hero-cards", "services", "studio-setups", "packages", "favicon"];

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

function AssetCard({ asset }: { asset: MediaAsset }) {
  const info = getFileInfo(asset.path);
  return (
    <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
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
              <p className="mt-0.5 break-all font-mono text-xs text-[#06111F]/70">{asset.path}</p>
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
              <input
                type="file"
                name="file"
                accept={asset.type === "image" ? "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" : "video/mp4,video/mov,video/webm"}
                className="block w-56 text-xs file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#0B7CFF]/10 file:px-4 file:py-2 file:text-xs file:font-black file:tracking-[0.08em] file:text-[#0B7CFF] file:transition hover:file:bg-[#0B7CFF]/20"
                required
              />
              <button type="submit" className="rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#06111F]">Upload</button>
            </form>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
          {info?.exists ? (
            asset.type === "video" ? (
              <video muted loop playsInline className="max-h-44 max-w-full rounded-xl object-contain shadow-sm">
                <source src={asset.path} type="video/mp4" />
              </video>
            ) : (
              <img alt={asset.label} src={asset.path} className="max-h-44 max-w-full rounded-xl object-contain shadow-sm" />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 p-8 text-[#06111F]/30">
              {asset.type === "video" ? (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              <p className="text-xs font-bold">No file uploaded yet</p>
              <p className="text-[10px]">{asset.recommendedWidth}×{asset.recommendedHeight}px recommended</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ManagementPage() {
  await requireAdmin();

  const grouped = groupOrder.map((gk) => ({
    group: gk,
    info: groupNames[gk],
    assets: siteMedia.filter((a) => a.group === gk),
  }));

  const total = siteMedia.length;
  const existing = siteMedia.filter((a) => {
    const info = getFileInfo(a.path);
    return info?.exists;
  }).length;

  return (
    <AdminShell title="Site Media">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">
            {existing}/{total} assets have files uploaded
          </p>
          <p className="mt-1 text-xs text-[#06111F]/50">
            All images and videos used across the website — upload or replace files here
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {grouped.map(({ group, info, assets }) => (
          <section key={group}>
            <div className="mb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#06111F]">{info.label}</h2>
              <p className="mt-0.5 text-xs text-[#06111F]/50">{info.description}</p>
            </div>
            <div className="grid gap-5">
              {assets.map((asset) => (
                <AssetCard key={asset.key} asset={asset} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {siteMedia.filter((a) => a.type === "video").length > 0 && (
        <div className="mt-10 rounded-[1.6rem] border border-dashed border-[#06111F]/10 p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/30">Videos</p>
          <p className="mt-2 text-sm text-[#06111F]/50">
            Upload MP4 files (1080×1920 recommended for vertical/social, 1920×1080 for landscape). Videos auto-play muted as card backgrounds.
          </p>
        </div>
      )}
    </AdminShell>
  );
}
