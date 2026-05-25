import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { deleteContractAction, updateContractAction } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { ContractFormFields } from "@/components/contract-form-fields";
import { contractStatusArabic, contractStatuses, services } from "@/lib/constants";
import { getBookings, getClients, getCompanySettings, getContracts, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { ContractPreview } from "@/components/contract-preview";
import { PrintButton } from "@/components/print-button";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ status?: string; clientId?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [contracts, clients, bookings, settings] = await Promise.all([getContracts(), getClients(), getBookings(), getCompanySettings()]);
  const hasFilters = params.status || params.clientId;
  const filtered = contracts.filter((contract) => (!params.status || contract.status === params.status) && (!params.clientId || contract.clientId === params.clientId));
  return (
    <AdminShell title="العقود">
      {!hasDatabase() ? <SetupNotice /> : null}

      <style>{`
@media print {
  .no-print { display: none !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`}</style>

      <details className="no-print mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm">
        <summary className="cursor-pointer p-6 text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">إنشاء عقد جديد</summary>
        <div className="px-6 pb-6">
          <ContractFormFields
            defaultCancellationPolicy={settings.defaultCancellationPolicy || ""}
            defaultPaymentTerms={settings.defaultPaymentTerms || ""}
            defaultRep={settings.defaultContractRepresentative || ""}
            services={services}
          />
        </div>
      </details>

      <form className="no-print mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} flex-1`} defaultValue={params.status || ""} name="status"><option value="">كل الحالات</option>{contractStatuses.map((status) => <option key={status} value={status}>{contractStatusArabic[status]}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">تصفية</button>
          <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/contracts">إعادة تعيين</a>
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد عقود</h2>
          <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد عقود تطابق التصفية." : "لم يتم إنشاء أي عقود بعد. اضغط على 'إنشاء عقد جديد' أعلاه."}</p>
          {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/contracts">إعادة تعيين</a> : null}
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((contract) => (
            <details className="rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm" key={contract.id}>
              <summary className="no-print flex cursor-pointer flex-wrap items-center gap-4 p-6 transition hover:bg-[#F7F8FB]">
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${contract.status === "SIGNED" ? "bg-green-100 text-green-700" : contract.status === "SENT" ? "bg-blue-100 text-blue-700" : contract.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{contractStatusArabic[contract.status]}</span>
                <h2 className="text-xl font-black">{contract.title}</h2>
                <p className="text-sm text-[#06111F]/55">{contract.client?.fullName || "بدون عميل"}</p>
                <p className="mr-auto text-xs text-[#06111F]/40">{new Date(contract.createdAt).toLocaleDateString("ar-EG")}</p>
              </summary>
              <div className="px-6 pb-6">
                <div className="no-print mb-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#06111F]/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">
                    {contract.totalPrice ? `قيمة العقد: ${Number(contract.totalPrice).toLocaleString("ar-EG")} EGP` : ""}
                  </span>
                  <form action={updateContractAction} className="flex flex-wrap gap-2">
                    <input name="contractId" type="hidden" value={contract.id} />
                    <input name="body" type="hidden" value={contract.body} />
                    <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="SENT">تحديد كمرسل</button>
                    <button className="rounded-full bg-green-600 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="SIGNED">تحديد كموقع</button>
                    <button className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="CANCELLED">إلغاء</button>
                  </form>
                  <details className="relative inline-block">
                    <summary className="cursor-pointer rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/60">تعديل النص</summary>
                    <div className="absolute left-0 top-full z-10 mt-2 w-[600px] max-w-[90vw] rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
                      <form action={updateContractAction} className="grid gap-3">
                        <input name="contractId" type="hidden" value={contract.id} />
                        <textarea className={inputClass} defaultValue={contract.body} name="body" rows={12} style={{ direction: "rtl", fontSize: 13, lineHeight: 1.7 }} />
                        <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" type="submit">حفظ التعديلات</button>
                      </form>
                    </div>
                  </details>
                  <a className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href={`/admin/export/contract/${contract.id}`}>تصدير Word</a>
                  <PrintButton />
                  <form action={deleteContractAction}>
                    <input name="contractId" type="hidden" value={contract.id} />
                    <ConfirmSubmit message="Are you sure you want to delete this contract? This action cannot be undone.">حذف</ConfirmSubmit>
                  </form>
                </div>

                {contract.status === "DRAFT" ? (
                  <p className="no-print mb-4 rounded-2xl bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">
                    مسودة عقد غير ملزمة قانونيا. يُرجى مراجعة العقد مع محام متخصص قبل التوقيع.
                  </p>
                ) : null}
                <ContractPreview
                  body={contract.body}
                  clientName={contract.client?.fullName || ""}
                  clientCompanyName={contract.client?.companyName}
                  title={contract.title}
                  totalPrice={contract.totalPrice ? Number(contract.totalPrice).toLocaleString("ar-EG") : null}
                  contractNumber={contract.id.slice(0, 8).toUpperCase()}
                  createdAt={contract.createdAt.toISOString()}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
