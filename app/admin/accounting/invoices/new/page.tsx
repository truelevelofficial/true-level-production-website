import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { getClients, getCompanySettings, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { InvoiceForm } from "../invoice-form";

export default async function NewInvoicePage() {
  await requireAdmin();
  const [clients, settings] = await Promise.all([getClients(), getCompanySettings()]);
  return (
    <AdminShell title="إنشاء فاتورة">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6">
        <a className="mb-4 inline-block text-sm font-bold text-[#0B7CFF]" href="/admin/accounting/invoices">← العودة إلى الفواتير</a>
        <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">إنشاء فاتورة جديدة</h2>
      </div>
      <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <InvoiceForm clients={clients} settings={settings} />
      </div>
    </AdminShell>
  );
}
