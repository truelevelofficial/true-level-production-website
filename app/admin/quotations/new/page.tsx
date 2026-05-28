import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getClients, getCompanySettings, hasDatabase } from "@/lib/admin-data";
import { QuotationForm } from "../quotation-form";

export default async function NewQuotationPage() {
  await requireAdmin();
  const [clients, settings] = await Promise.all([getClients(), getCompanySettings()]);
  return (
    <AdminShell title="إنشاء عرض سعر">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6">
        <a className="mb-4 inline-block text-sm font-bold text-[#0B7CFF]" href="/admin/quotations">← العودة إلى عروض الأسعار</a>
        <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">إنشاء عرض سعر جديد</h2>
      </div>
      <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <QuotationForm clients={clients} settings={settings} />
      </div>
    </AdminShell>
  );
}
