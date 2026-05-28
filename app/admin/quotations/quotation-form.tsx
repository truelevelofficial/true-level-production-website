"use client";

import { useTransition, useState, useRef, useEffect, useCallback } from "react";
import { Field, inputClass } from "@/components/form-fields";
import { createQuotationAction } from "@/lib/actions";

interface Item {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
}

let keyCounter = 0;
function nextKey() { return ++keyCounter; }

export function QuotationForm({ clients, settings, quotation }: { clients: any[]; settings: Record<string, string>; quotation?: any }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: string; error?: string; quotationId?: string } | null>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<Item[]>(() => {
    if (quotation?.items?.length) return quotation.items.map((i: any) => ({ key: String(nextKey()), description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice), discount: String(i.discount || 0) }));
    return [{ key: String(nextKey()), description: "", quantity: "1", unitPrice: "", discount: "0" }];
  });

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const totalDiscount = items.reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const taxRate = Number(settings.quotationsTaxRate) || 0;
  const taxable = subtotal - totalDiscount;
  const taxAmount = taxable * (taxRate / 100);
  const grandTotal = taxable + taxAmount;

  const addItem = useCallback(() => setItems((prev) => [...prev, { key: String(nextKey()), description: "", quantity: "1", unitPrice: "", discount: "0" }]), []);
  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const updateItem = useCallback((key: string, field: keyof Item, value: string) => setItems((prev) => prev.map((i) => i.key === key ? { ...i, [field]: value } : i)), []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("items", JSON.stringify(items.map((i) => ({ ...i, total: (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0) - (Number(i.discount) || 0) }))));
    fd.set("subtotal", String(subtotal));
    fd.set("discount", String(totalDiscount));
    fd.set("taxRate", String(taxRate));
    fd.set("taxAmount", String(taxAmount));
    fd.set("grandTotal", String(grandTotal));
    setResult(null);
    startTransition(async () => {
      const res = await createQuotationAction(fd);
      setResult(res);
      if (res.success && !quotation) {
        e.currentTarget.reset();
        setItems([{ key: String(nextKey()), description: "", quantity: "1", unitPrice: "", discount: "0" }]);
      }
    });
  };

  useEffect(() => { if (result && msgRef.current) msgRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); }, [result]);

  return (
    <form className="grid gap-5" dir="rtl" noValidate onSubmit={handleSubmit}>
      <div ref={msgRef}>
        {result?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{result.error}</p> : null}
        {result?.success ? (
          <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">
            {result.success}{result.quotationId ? <a className="mr-3 text-[#0B7CFF] underline" href={`/admin/quotations/${result.quotationId}`}>عرض ←</a> : null}
          </p>
        ) : null}
      </div>

      <Field label="العميل">
        <select className={inputClass} defaultValue={quotation?.clientId || ""} name="clientId" required>
          <option value="">اختر عميل</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>)}
        </select>
      </Field>

      <Field label="نوع الخدمة">
        <input className={inputClass} defaultValue={quotation?.serviceType || ""} name="serviceType" placeholder="مثل: تصوير فيديو، إنتاج محتوى..." />
      </Field>

      <Field label="صلاحية العرض حتى">
        <input className={inputClass} defaultValue={quotation?.validUntil ? new Date(quotation.validUntil).toISOString().slice(0, 10) : ""} name="validUntil" type="date" />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/40">البنود</span>
          <button className="rounded-full bg-[#0B7CFF] px-4 py-1 text-xs font-black uppercase tracking-[0.1em] text-white" onClick={addItem} type="button">+ إضافة بند</button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-[#06111F]/10">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/40">
                <th className="p-3">الوصف</th><th className="p-3">الكمية</th><th className="p-3">سعر الوحدة</th><th className="p-3">الخصم</th><th className="p-3">الإجمالي</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) - (Number(item.discount) || 0);
                return (
                  <tr className="border-b border-[#06111F]/5" key={item.key}>
                    <td className="p-1"><input className={inputClass} placeholder="وصف البند" required value={item.description} onChange={(e) => updateItem(item.key, "description", e.target.value)} /></td>
                    <td className="p-1 w-20"><input className={inputClass} min="0.01" required step="any" type="number" value={item.quantity} onChange={(e) => updateItem(item.key, "quantity", e.target.value)} /></td>
                    <td className="p-1 w-28"><input className={inputClass} min="0" required step="0.01" type="number" value={item.unitPrice} onChange={(e) => updateItem(item.key, "unitPrice", e.target.value)} /></td>
                    <td className="p-1 w-24"><input className={inputClass} min="0" step="0.01" type="number" value={item.discount} onChange={(e) => updateItem(item.key, "discount", e.target.value)} /></td>
                    <td className="p-3 font-bold">{itemTotal.toLocaleString()} EGP</td>
                    <td className="p-1 w-10">{items.length > 1 ? <button className="text-xs font-bold text-red-600" onClick={() => removeItem(item.key)} type="button">✕</button> : null}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#06111F]/10 font-bold">
                <td className="p-3" colSpan={4}>الإجمالي قبل الخصم</td>
                <td className="p-3">{subtotal.toLocaleString()} EGP</td><td></td>
              </tr>
              <tr>
                <td className="p-3" colSpan={4}>خصم البنود</td>
                <td className="p-3">{totalDiscount.toLocaleString()} EGP</td><td></td>
              </tr>
              {taxRate > 0 ? <tr>
                <td className="p-3" colSpan={4}>الضريبة ({taxRate}%)</td>
                <td className="p-3">{taxAmount.toLocaleString()} EGP</td><td></td>
              </tr> : null}
              <tr className="border-t-2 border-[#06111F] text-lg font-black text-[#0B7CFF]">
                <td className="p-3" colSpan={4}>الإجمالي النهائي</td>
                <td className="p-3">{grandTotal.toLocaleString()} EGP</td><td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Field label="ملاحظات">
        <textarea className={inputClass} defaultValue={quotation?.notes || ""} name="notes" rows={3} />
      </Field>
      <Field label="الشروط والأحكام">
        <textarea className={inputClass} defaultValue={quotation?.terms || ""} name="terms" placeholder="شروط عامة، مدة التسليم، طريقة الدفع..." rows={3} />
      </Field>

      <button className="rounded-full bg-[#0B7CFF] px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20 disabled:opacity-50" disabled={isPending} type="submit">
        {isPending ? "جاري الحفظ…" : quotation ? "حفظ التعديلات" : "إنشاء عرض السعر"}
      </button>
    </form>
  );
}
