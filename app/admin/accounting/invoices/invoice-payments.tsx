"use client";

import { useTransition, useState } from "react";
import { Field, inputClass } from "@/components/form-fields";
import { addInvoicePaymentAction } from "@/lib/actions";
import { paymentMethods, paymentMethodArabic } from "@/lib/constants";

export function InvoicePayments({ invoiceId, payments }: { invoiceId: string; payments: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("invoiceId", invoiceId);
    setResult(null);
    startTransition(async () => {
      const res = await addInvoicePaymentAction(fd);
      setResult(res);
      if (res.success) setShowForm(false);
    });
  };

  return (
    <div>
      {payments.length === 0 ? <p className="text-sm text-[#06111F]/55">لا توجد مدفوعات مسجلة</p> : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div className="rounded-xl border border-[#06111F]/10 p-3" key={p.id}>
              <p className="text-sm font-bold">{Number(p.amount).toLocaleString()} EGP</p>
              <p className="text-xs text-[#06111F]/55">{paymentMethodArabic[p.method] || p.method} — {new Date(p.date).toLocaleDateString("ar-EG")}</p>
              {p.description ? <p className="text-xs text-[#06111F]/45">{p.description}</p> : null}
            </div>
          ))}
        </div>
      )}
      <button className="mt-4 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white" onClick={() => setShowForm(!showForm)} type="button">
        {showForm ? "إلغاء" : "+ إضافة دفع"}
      </button>
      {result?.error ? <p className="mt-2 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-700">{result.error}</p> : null}
      {result?.success ? <p className="mt-2 rounded-xl bg-green-50 p-2 text-xs font-bold text-green-700">{result.success}</p> : null}
      {showForm ? (
        <form onSubmit={handlePayment} className="mt-4 grid gap-3">
          <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" min="0.01" step="0.01" /></Field>
          <Field label="تاريخ الدفع"><input className={inputClass} name="paymentDate" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
          <Field label="طريقة الدفع"><select className={inputClass} name="method" required>{paymentMethods.map((m) => <option key={m} value={m}>{paymentMethodArabic[m]}</option>)}</select></Field>
          <Field label="ملاحظات"><textarea className={inputClass} name="description" rows={2} /></Field>
          <button type="submit" disabled={isPending} className="rounded-full bg-green-600 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white disabled:opacity-50">
            {isPending ? "جاري…" : "تسجيل الدفع"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
