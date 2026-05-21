import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { CompanySettingsForm } from "@/components/company-settings-form";
import { CalendarDiagnostic } from "@/components/calendar-diagnostic";
import { getCompanySettings, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getCompanySettings();
  return (
    <AdminShell title="Settings">
      {!hasDatabase() ? <SetupNotice /> : null}
      <CalendarDiagnostic />
      <CompanySettingsForm settings={settings} />
    </AdminShell>
  );
}
