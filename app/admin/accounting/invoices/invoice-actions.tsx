"use client";

import { useTransition, useState } from "react";
import { addInvoicePaymentAction, updateInvoiceStatusAction, deleteInvoiceAction } from "@/lib/actions";
import { paymentMethods, paymentMethodArabic } from "@/lib/constants";

export function InvoiceActions({ invoiceId, status, total, paidAmount }: { invoiceId: string; status: string; total?: number; paidAmount?: number }) {
  const [open, setOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ success?: string; error?: string } | null>(null);

  const doAction = (action: string) => {
    const fd = new FormData();
    fd.set("invoiceId", invoiceId);
    if (action === "markSent") {
      fd.set("status", "SENT");
      startTransition(async () => { setMsg(await updateInvoiceStatusAction(fd)); });
    } else if (action === "markCancelled") {
      fd.set("status", "CANCELLED");
      startTransition(async () => { setMsg(await updateInvoiceStatusAction(fd)); });
    } else if (action === "markPaid") {
      fd.set("status", "PAID");
      startTransition(async () => { setMsg(await updateInvoiceStatusAction(fd)); });
    } else if (action === "delete") {
      if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
      fd.set("invoiceId", invoiceId);
      startTransition(async () => { setMsg(await deleteInvoiceAction(fd)); });
    }
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("invoiceId", invoiceId);
    setMsg(null);
    startTransition(async () => {
      const res = await addInvoicePaymentAction(fd);
      setMsg(res);
      if (res.success) setShowPayment(false);
    });
  };

  const remaining = (total || 0) - (paidAmount || 0);

  return (
    <div className="relative">
      <button className="rounded-full bg-[#0B7CFF]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF]" onClick={() => setOpen(!open)} type="button">
        {isPending ? "جاري…" : "إجراءات"}
      </button>
      {msg?.success ? <p className="mt-1 text-xs font-bold text-green-600">{msg.success}</p> : null}
      {msg?.error ? <p className="mt-1 text-xs font-bold text-red-600">{msg.error}</p> : null}
      {open ? (
        <div className="absolute left-0 top-full z-10 mt-2 w-56 rounded-2xl border border-[#06111F]/10 bg-white p-3 shadow-xl">
          <div className="flex flex-col gap-2">
            <a className="rounded-full bg-[#06111F]/5 px-4 py-2 text-center text-xs font-bold text-[#06111F] hover:bg-[#0B7CFF]/10" href={`/admin/accounting/invoices/${invoiceId}`}>عرض / تعديل</a>

            {remaining > 0 && status !== "CANCELLED" ? (
              showPayment ? (
                <form onSubmit={handleAddPayment} className="grid gap-2 rounded-xl border border-[#06111F]/10 p-2">
                  <input className="w-full rounded-lg border border-[#06111F]/20 px-2 py-1 text-xs" name="amount" type="number" min="0.01" max={remaining} step="0.01" placeholder={`المبلغ (أقصى ${remaining.toLocaleString()} EGP)`} required />
                  <input className="w-full rounded-lg border border-[#06111F]/20 px-2 py-1 text-xs" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  <select className="w-full rounded-lg border border-[#06111F]/20 px-2 py-1 text-xs" name="method" required>
                    {paymentMethods.map((m) => <option key={m} value={m}>{paymentMethodArabic[m]}</option>)}
                  </select>
                  <input className="w-full rounded-lg border border-[#06111F]/20 px-2 py-1 text-xs" name="description" placeholder="ملاحظات الدفع (اختياري)" />
                  <div className="flex gap-1">
                    <button className="flex-1 rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white disabled:opacity-50" disabled={isPending} type="submit">{isPending ? "جاري…" : "تسجيل"}</button>
                    <button className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600" onClick={() => setShowPayment(false)} type="button">إلغاء</button>
                  </div>
                </form>
              ) : (
                <button className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-200" onClick={() => setShowPayment(true)} type="button">إضافة دفعة</button>
              )
            ) : null}

            {status === "DRAFT" ? <button className="rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600" onClick={() => doAction("markSent")} type="button">تعيين كمرسلة</button> : null}
            {status === "SENT" ? <button className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700" onClick={() => doAction("markPaid")} type="button">تعيين كمدفوعة</button> : null}
            {status !== "CANCELLED" ? <button className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600" onClick={() => doAction("markCancelled")} type="button">إلغاء الفاتورة</button> : null}

            <a className="rounded-full bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-700 hover:bg-amber-200" href={`/admin/export/invoice/${invoiceId}`} target="_blank">تصدير PDF</a>
            <button className="rounded-full bg-purple-100 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-200" onClick={() => window.open(`/admin/accounting/invoices/${invoiceId}/print`, "_blank")} type="button">طباعة</button>

            <button className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200" onClick={() => doAction("delete")} type="button">حذف</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
