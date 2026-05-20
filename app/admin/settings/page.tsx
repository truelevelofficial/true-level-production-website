import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <AdminShell title="Settings">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black uppercase tracking-[-0.05em]">Deployment checklist</h2>
        <p>1. Add Supabase PostgreSQL `DATABASE_URL` and `DIRECT_URL`.</p>
        <p>2. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long `ADMIN_SESSION_SECRET`.</p>
        <p>3. Run `npm.cmd run db:push` once against the production database.</p>
        <p>4. Optional: configure `RESEND_API_KEY` and `ADMIN_NOTIFY_EMAIL` for email notifications.</p>
        <p>5. Connect Vercel domain: `production.true-level.org`.</p>
      </div>
    </AdminShell>
  );
}
